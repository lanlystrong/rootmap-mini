/**
 * gen-icons.js — 生成底部 TabBar 图标(纯 Node,零依赖,内置 zlib 编码 PNG)。
 *
 * 用法: node scripts/gen-icons.js
 * 产物: miniprogram/assets/tab-{home,learn,review,profile}[-on].png 共 8 张,81×81。
 *   - 普通态 灰 #94A3B8,选中态 蓝 #3B82F6(与 app.json tabBar selectedColor 一致)。
 * 实现:以 2× 超采样(162×162)先 fill 后 erase 形状,再 2×2 盒降采样到 81×81,边缘自然抗锯齿。
 * 形状:首页=房子、学习=闭合的书、复习=时钟、我的=人形(头 + 肩)。
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const TARGET = 81;
const SCALE = 2;
const S = TARGET * SCALE; // 162

const GRAY = [0x94, 0xA3, 0xB8];
const BLUE = [0x3B, 0x82, 0xF6];

// ---- 几何谓词(0..1 归一化坐标,y 向下)----
function inRect(x, y, x0, y0, x1, y1) {
  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}
function inRoundRect(x, y, x0, y0, x1, y1, r) {
  const cx = Math.max(x0 + r, Math.min(x, x1 - r));
  const cy = Math.max(y0 + r, Math.min(y, y1 - r));
  const dx = x - cx, dy = y - cy;
  return inRect(x, y, x0, y0, x1, y1) && (dx * dx + dy * dy <= r * r || inRect(x, y, x0 + r, y0, x1 - r, y1) || inRect(x, y, x0, y0 + r, x1, y1 - r));
}
function inCircle(x, y, cx, cy, r) {
  return Math.hypot(x - cx, y - cy) <= r;
}
function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function inPoly(pts, x, y) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
    if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

// 每个图标返回 { fill(x,y):bool, erase(x,y):bool };buffer 初始透明,先 fill 后 erase。
const shapes = {
  // 首页=房子:三角屋顶 + 房身矩形 + 门(erase 挖空)。
  home: {
    fill(x, y) {
      return inPoly([[0.13, 0.42], [0.5, 0.20], [0.87, 0.42]], x, y)
        || inRect(x, y, 0.26, 0.40, 0.74, 0.72);
    },
    erase(x, y) {
      return inRect(x, y, 0.45, 0.52, 0.55, 0.72); // 门
    },
  },
  // 闭合的书:封面圆角矩形 + 左侧书脊竖缝 + 两道内页横线(erase 挖空)。
  learn: {
    fill(x, y) {
      return inRoundRect(x, y, 0.24, 0.30, 0.78, 0.72, 0.05);
    },
    erase(x, y) {
      return inRect(x, y, 0.315, 0.36, 0.345, 0.66)      // 书脊缝
        || inRect(x, y, 0.38, 0.435, 0.74, 0.465)         // 内页线 1
        || inRect(x, y, 0.38, 0.555, 0.74, 0.585);        // 内页线 2
    },
  },
  // 时钟:表圈 + 分针(上)+ 时针(右)+ 圆心。
  review: {
    fill(x, y) {
      const d = Math.hypot(x - 0.5, y - 0.5);
      if (d >= 0.26 && d <= 0.34) return true;
      if (distSeg(x, y, 0.5, 0.5, 0.5, 0.26) <= 0.045) return true;
      if (distSeg(x, y, 0.5, 0.5, 0.68, 0.58) <= 0.045) return true;
      if (d <= 0.05) return true;
      return false;
    },
    erase() { return false; },
  },
  // 人形:头圆 + 肩圆(相切合成人形轮廓)。
  profile: {
    fill(x, y) {
      return inCircle(x, y, 0.5, 0.32, 0.15) || inCircle(x, y, 0.5, 0.72, 0.24);
    },
    erase() { return false; },
  },
};

// ---- PNG 编码 ----
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// 渲染某形状 → 超采样 alpha → 降采样 → 上色 → PNG buffer
function render(name, color) {
  const hi = Buffer.alloc(S * S);
  const { fill, erase } = shapes[name];
  for (let j = 0; j < S; j++) {
    const y = (j + 0.5) / S;
    for (let i = 0; i < S; i++) {
      const x = (i + 0.5) / S;
      if (fill(x, y)) hi[j * S + i] = 255;
    }
  }
  for (let j = 0; j < S; j++) {
    const y = (j + 0.5) / S;
    for (let i = 0; i < S; i++) {
      const x = (i + 0.5) / S;
      if (erase(x, y)) hi[j * S + i] = 0;
    }
  }
  const rgba = Buffer.alloc(TARGET * TARGET * 4);
  for (let ty = 0; ty < TARGET; ty++) {
    for (let tx = 0; tx < TARGET; tx++) {
      let sum = 0;
      for (let dy = 0; dy < SCALE; dy++) for (let dx = 0; dx < SCALE; dx++) {
        sum += hi[(ty * SCALE + dy) * S + (tx * SCALE + dx)];
      }
      const a = Math.round(sum / (SCALE * SCALE));
      const p = (ty * TARGET + tx) * 4;
      rgba[p] = color[0]; rgba[p + 1] = color[1]; rgba[p + 2] = color[2]; rgba[p + 3] = a;
    }
  }
  return encodePNG(TARGET, TARGET, rgba);
}

const outDir = path.join(__dirname, '..', 'miniprogram', 'assets');
fs.mkdirSync(outDir, { recursive: true });
const kinds = ['home', 'learn', 'review', 'profile'];
for (const k of kinds) {
  fs.writeFileSync(path.join(outDir, `tab-${k}.png`), render(k, GRAY));
  fs.writeFileSync(path.join(outDir, `tab-${k}-on.png`), render(k, BLUE));
}
console.log('✓ 图标已生成 → miniprogram/assets/tab-{home,learn,review,profile}[-on].png (8 张, 81×81)');
