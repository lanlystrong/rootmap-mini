const test = require('node:test');
const assert = require('node:assert');
const fixture = require('./helpers/content-fixture');
const { buildIndex } = require('../miniprogram/utils/content');

const idx = buildIndex(fixture);

test('byId 命中', () => assert.equal(idx.byId('inspect').word, 'inspect'));
test('rootWords 聚合该根全族(4 词)且含词根段', () => {
  const list = idx.rootWords('root-spect');
  assert.equal(list.length, 4);
  assert.ok(list.every(w => w.breakdown.some(b => b.type === 'root' && b.refId === 'root-spect')));
});
test('affixWords 反查', () => {
  const ids = idx.affixWords('affix-in').map(w => w.id);
  assert.ok(ids.includes('inspect'));
});
test('sortedRoots 按 root 文本字母序', () => {
  assert.deepStrictEqual(idx.sortedRoots.map(r => r.root), ['spect']);
});
test('searchWord / searchRoot 子串命中', () => {
  assert.equal(idx.searchWord('spec')[0].id, 'inspect');
  assert.equal(idx.searchRoot('spec')[0].id, 'root-spect');
});
test('未知 id 返回空结果不抛错', () => {
  assert.equal(idx.rootWords('root-nope').length, 0);
  assert.equal(idx.byId('nope'), undefined);
  assert.equal(idx.searchWord('zzz').length, 0);
});

test('groupedRoots 按 group 聚类,组内保持原序', () => {
  const g = idx.groupedRoots();
  assert.equal(g.length, 1);
  assert.equal(g[0].key, '看 · 光 · 声');
  assert.deepStrictEqual(g[0].items.map(r => r.id), ['root-spect']);
});

test('affixSections 拆前缀/后缀两大区块并子分组', () => {
  const secs = idx.affixSections();
  assert.deepStrictEqual(secs.map(s => s.type), ['prefix', 'suffix']);
  const pre = secs[0];
  assert.deepStrictEqual(pre.groups.map(g => g.key), ['方向 · 位置', '时间 · 次序']);
  assert.deepStrictEqual(pre.groups[0].items.map(a => a.id), ['affix-in', 'affix-pro']);
  const suf = secs[1];
  assert.deepStrictEqual(suf.groups.map(g => g.key), ['表「…者 / …物」']);
  assert.deepStrictEqual(suf.groups[0].items.map(a => a.id), ['affix-ator']);
});
