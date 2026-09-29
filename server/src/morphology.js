// server/src/morphology.js —— 全量 CET4 形态学词典(词根 + 词缀)
//
// 以 miniprogram/data 的 30 根 + 66 词缀为基底,追加拉丁/希腊真词根与常见词缀,
// 供 scripts/generate-cet4.js 做构词拆解。拼写变体(variants)是拆解准确率的关键,
// 需覆盖同化/交替等形态(如 ced→ceed/cess、cept→cip/ceiv)。
//
// 约定:生成器按「base 词根先、extra 词根后」建变体索引,base 变体优先,extra 不与其争用
// (如 base root-grad 已含 gress、root-cept 已含 cept/cip/ceiv、root-tend 已含 tent)。
//
// ⚠ 依赖方向是**单向**的,禁止反向 require:
//   本文件 → miniprogram/data/{roots,affixes}   本文件的基底是**手写层**(30 根 / 66 缀),
//   而不是交付集 miniprogram/data/index.js(223 根 / 151 缀)。若改成 require 交付集,
//   本文件会把生成结果当成自家基底再加一遍 extra,自我放大成正反馈。
//   miniprogram/data/index.js → miniprogram/data/generated/** → (由 generate-content.js 装配)
//   交付集的构建不经过本文件:generate-content.js 直接读第 1 段产物 server/data/cet4/index.js,
//   因此词典演进**不会**隐式改变已交付数据 —— 只有显式重跑第 1 段才会。改动本文件后必须重跑
//   generate-cet4.js,再重跑 generate-content.js,最后 npm run validate + npm run seed。

const baseRoots = require('../../miniprogram/data/roots');
const baseAffixes = require('../../miniprogram/data/affixes');

// —— 追加词根 ——
const extraRoots = [
  // === 看 · 说 · 写 ===
  { id: 'root-aud', root: 'aud', variants: ['aud', 'audi', 'audit'], zh: '听', group: '看 · 光 · 声', meaning: '听、听见' },
  { id: 'root-cid', root: 'cid', variants: ['cid', 'cis', 'cide', 'cise', 'precis'], zh: '切/杀', group: '转 · 动 · 推', meaning: '切、割、杀' },
  { id: 'root-claim', root: 'claim', variants: ['claim', 'clam'], zh: '喊/宣称', group: '说 · 写 · 画', meaning: '喊叫、宣称' },
  { id: 'root-doc', root: 'doc', variants: ['doc', 'doct'], zh: '教', group: '说 · 写 · 画', meaning: '教、教导' },
  { id: 'root-nunc', root: 'nunc', variants: ['nunc', 'nounce', 'nunci'], zh: '说/宣布', group: '说 · 写 · 画', meaning: '宣告、宣布' },
  { id: 'root-verb', root: 'verb', variants: ['verb'], zh: '词/言语', group: '说 · 写 · 画', meaning: '词、言语' },
  { id: 'root-voc', root: 'voc', variants: ['voc', 'vok', 'voice', 'vot', 'vow'], zh: '喊/叫', group: '说 · 写 · 画', meaning: '呼喊、召唤' },

  // === 心 · 知 · 感 ===
  { id: 'root-anim', root: 'anim', variants: ['anim'], zh: '生命/心', group: '心 · 知 · 感', meaning: '生命、心灵' },
  { id: 'root-cert', root: 'cert', variants: ['cert', 'certi'], zh: '确定', group: '心 · 知 · 感', meaning: '确实、确信' },
  { id: 'root-cogn', root: 'cogn', variants: ['cogn', 'cogni', 'gnos', 'gnit'], zh: '认识', group: '心 · 知 · 感', meaning: '认识、知道' },
  { id: 'root-cred', root: 'cred', variants: ['cred', 'credit', 'creed'], zh: '相信', group: '心 · 知 · 感', meaning: '相信、信任' },
  { id: 'root-dub', root: 'dub', variants: ['dub', 'dubit', 'doubt'], zh: '怀疑', group: '心 · 知 · 感', meaning: '怀疑、不确定' },
  { id: 'root-ment', root: 'ment', variants: ['ment', 'mind'], zh: '心/思考', group: '心 · 知 · 感', meaning: '心、思想' },
  { id: 'root-memor', root: 'memor', variants: ['memor', 'mem', 'membr'], zh: '记忆', group: '心 · 知 · 感', meaning: '记忆' },
  { id: 'root-path', root: 'path', variants: ['path', 'pathy', 'pass', 'pati'], zh: '感受/病', group: '心 · 知 · 感', meaning: '感受、痛苦、疾病' },
  { id: 'root-psych', root: 'psych', variants: ['psych', 'psycho'], zh: '心/精神', group: '心 · 知 · 感', meaning: '心灵、精神' },
  { id: 'root-sci', root: 'sci', variants: ['sci', 'scient'], zh: '知道', group: '心 · 知 · 感', meaning: '知道、知识' },
  { id: 'root-sens', root: 'sens', variants: ['sens', 'sent', 'scent'], zh: '感觉', group: '心 · 知 · 感', meaning: '感觉、感知' },
  { id: 'root-sper', root: 'sper', variants: ['sper', 'spair'], zh: '希望', group: '心 · 知 · 感', meaning: '希望' },
  { id: 'root-spir', root: 'spir', variants: ['spir', 'spire', 'spirit'], zh: '呼吸/精神', group: '心 · 知 · 感', meaning: '呼吸、精神' },

  // === 动 · 行 · 走 ===
  { id: 'root-act', root: 'act', variants: ['act', 'ag', 'ig'], zh: '做/驱动', group: '转 · 动 · 推', meaning: '做、行动、驱动' },
  { id: 'root-ambul', root: 'ambul', variants: ['ambul', 'ambl', 'ambulat'], zh: '行走', group: '运 · 携 · 行', meaning: '行走' },
  { id: 'root-cur', root: 'cur', variants: ['cur', 'curr', 'curs', 'cours', 'cou'], zh: '跑', group: '运 · 携 · 行', meaning: '跑、流动' },
  { id: 'root-flu', root: 'flu', variants: ['flu', 'flux', 'fluct', 'fluv'], zh: '流', group: '运 · 携 · 行', meaning: '流动' },
  { id: 'root-fug', root: 'fug', variants: ['fug', 'fugit'], zh: '逃', group: '运 · 携 · 行', meaning: '逃跑' },
  { id: 'root-ject', root: 'ject', variants: ['ject', 'jet'], zh: '投/掷', group: '转 · 动 · 推', meaning: '投、掷、抛' },
  { id: 'root-migr', root: 'migr', variants: ['migr', 'migrat'], zh: '迁移', group: '运 · 携 · 行', meaning: '迁移' },
  { id: 'root-mut', root: 'mut', variants: ['mut', 'mutat'], zh: '改变', group: '转 · 动 · 推', meaning: '改变' },
  { id: 'root-rupt', root: 'rupt', variants: ['rupt'], zh: '破', group: '转 · 动 · 推', meaning: '破裂、断裂' },
  { id: 'root-salt', root: 'salt', variants: ['salt', 'sult', 'sault'], zh: '跳', group: '运 · 携 · 行', meaning: '跳跃' },
  // scent(气味)属 root-sens(sentire 感觉),不属本根;scend 只管「爬/升」。
  { id: 'root-scend', root: 'scend', variants: ['scend'], zh: '爬/升', group: '运 · 携 · 行', meaning: '攀爬、上升' },
  { id: 'root-sess', root: 'sess', variants: ['sess', 'sid', 'sed', 'sedat'], zh: '坐', group: '建 · 构 · 放', meaning: '坐、停留' },
  { id: 'root-volv', root: 'volv', variants: ['volv', 'volut', 'volu'], zh: '滚/转', group: '转 · 动 · 推', meaning: '滚动、转动' },

  // === 建 · 构 · 放 ===
  { id: 'root-fac', root: 'fac', variants: ['fac', 'fact', 'fect', 'fic', 'fy', 'fice', 'fig', 'facil'], zh: '做/制作', group: '建 · 构 · 放', meaning: '做、制造' },
  { id: 'root-lect', root: 'lect', variants: ['lect', 'lectu'], zh: '选/读', group: '心 · 知 · 感', meaning: '挑选、阅读' },
  { id: 'root-lig', root: 'lig', variants: ['lig', 'lige'], zh: '绑/结', group: '建 · 构 · 放', meaning: '捆绑、联结' },
  { id: 'root-plic', root: 'plic', variants: ['plic', 'ply', 'plex', 'plicit', 'ploit', 'ploy'], zh: '折/叠', group: '建 · 构 · 放', meaning: '折叠、缠绕' },
  { id: 'root-prehend', root: 'prehend', variants: ['prehend', 'prehens', 'pris', 'prise', 'prent'], zh: '抓/取', group: '取 · 手 · 力', meaning: '抓住、理解' },
  { id: 'root-stan', root: 'stan', variants: ['stan', 'stant', 'stanc', 'sist', 'stit', 'sta', 'stand', 'stat', 'state', 'statu', 'stitut', 'stitute', 'stance', 'status', 'statue', 'stable', 'stabl', 'stabil'], zh: '站', group: '建 · 构 · 放', meaning: '站立、稳定' },
  { id: 'root-tect', root: 'tect', variants: ['tect', 'teg'], zh: '盖/覆盖', group: '建 · 构 · 放', meaning: '覆盖、遮蔽' },

  // === 取 · 手 · 力 ===
  { id: 'root-hibit', root: 'hibit', variants: ['hibit', 'habit'], zh: '持/拥有', group: '取 · 手 · 力', meaning: '拥有、持有' },
  { id: 'root-quir', root: 'quir', variants: ['quir', 'quis', 'quest', 'quer'], zh: '寻求', group: '取 · 手 · 力', meaning: '寻求、询问' },
  { id: 'root-tang', root: 'tang', variants: ['tang', 'tact', 'tig', 'ting', 'tag'], zh: '接触', group: '取 · 手 · 力', meaning: '接触、触摸' },
  { id: 'root-ten', root: 'ten', variants: ['ten', 'tain', 'tin', 'tenu'], zh: '持/握', group: '取 · 手 · 力', meaning: '握住、持有' },
  { id: 'root-fer', root: 'fer', variants: ['fer', 'ferr', 'lat'], zh: '带/运', group: '运 · 携 · 行', meaning: '携带、运送' },

  // === 状 · 量 · 规 ===
  { id: 'root-clar', root: 'clar', variants: ['clar', 'clear'], zh: '清楚', group: '状 · 量 · 规', meaning: '清楚、明亮' },
  { id: 'root-equ', root: 'equ', variants: ['equ', 'equi', 'equa', 'iqu'], zh: '相等', group: '状 · 量 · 规', meaning: '相等、公平' },
  { id: 'root-magn', root: 'magn', variants: ['magn', 'maj', 'max', 'meg'], zh: '大', group: '状 · 量 · 规', meaning: '大' },
  { id: 'root-min', root: 'min', variants: ['min', 'mini', 'minor', 'minut'], zh: '小', group: '状 · 量 · 规', meaning: '小、少' },
  { id: 'root-ordin', root: 'ordin', variants: ['ordin', 'ord'], zh: '顺序', group: '状 · 量 · 规', meaning: '顺序、秩序' },
  { id: 'root-plen', root: 'plen', variants: ['plen', 'plet', 'ple'], zh: '满', group: '状 · 量 · 规', meaning: '满、充满' },
  { id: 'root-prob', root: 'prob', variants: ['prob', 'prov', 'proof', 'probab'], zh: '检验/证明', group: '心 · 知 · 感', meaning: '检验、证明' },
  { id: 'root-quant', root: 'quant', variants: ['quant', 'quanti'], zh: '量/多少', group: '状 · 量 · 规', meaning: '数量' },
  { id: 'root-simil', root: 'simil', variants: ['simil', 'simul', 'sembl'], zh: '相似', group: '状 · 量 · 规', meaning: '相似、相同' },
  { id: 'root-ver', root: 'ver', variants: ['ver', 'veri'], zh: '真', group: '状 · 量 · 规', meaning: '真实' },

  // === 生 · 身 · 死 ===
  { id: 'root-corp', root: 'corp', variants: ['corp', 'corpor', 'corpus'], zh: '身体', group: '生 · 身 · 死', meaning: '身体、躯体' },
  { id: 'root-dent', root: 'dent', variants: ['dent', 'denti'], zh: '牙', group: '生 · 身 · 死', meaning: '牙齿' },
  { id: 'root-gen', root: 'gen', variants: ['gen', 'gener', 'gent', 'genit', 'gn'], zh: '生/产生', group: '生 · 身 · 死', meaning: '出生、产生' },
  { id: 'root-mort', root: 'mort', variants: ['mort', 'mor', 'morti'], zh: '死', group: '生 · 身 · 死', meaning: '死亡' },
  { id: 'root-nat', root: 'nat', variants: ['nat', 'nasc', 'nativ'], zh: '出生', group: '生 · 身 · 死', meaning: '出生、天生' },
  { id: 'root-viv', root: 'viv', variants: ['viv', 'vit', 'vita'], zh: '活/生命', group: '生 · 身 · 死', meaning: '活、生命' },

  // === 时 · 序 · 位 ===
  { id: 'root-ann', root: 'ann', variants: ['ann', 'enn', 'annu'], zh: '年', group: '时 · 序 · 位', meaning: '年' },
  { id: 'root-dur', root: 'dur', variants: ['dur', 'durat'], zh: '持续', group: '时 · 序 · 位', meaning: '持续、坚硬' },
  { id: 'root-fin', root: 'fin', variants: ['fin', 'finit'], zh: '结束/界限', group: '时 · 序 · 位', meaning: '结束、边界' },
  { id: 'root-loc', root: 'loc', variants: ['loc', 'loca'], zh: '地方', group: '时 · 序 · 位', meaning: '地点、位置' },
  { id: 'root-temp', root: 'temp', variants: ['temp', 'tempor'], zh: '时间', group: '时 · 序 · 位', meaning: '时间、时节' },
  { id: 'root-term', root: 'term', variants: ['term', 'termin'], zh: '界限/结束', group: '时 · 序 · 位', meaning: '界限、终点' },
  { id: 'root-vect', root: 'vect', variants: ['vect', 'veh', 'vey', 'voi', 'via', 'voy'], zh: '路/运', group: '运 · 携 · 行', meaning: '道路、运送' },

  // === 社 · 法 · 治 ===
  { id: 'root-civ', root: 'civ', variants: ['civ', 'civil', 'cit'], zh: '市民/城', group: '社 · 法 · 治', meaning: '市民、城市' },
  { id: 'root-domin', root: 'domin', variants: ['domin', 'dom'], zh: '统治/主人', group: '社 · 法 · 治', meaning: '主人、统治' },
  { id: 'root-jur', root: 'jur', variants: ['jur', 'jus', 'just'], zh: '法/公正', group: '社 · 法 · 治', meaning: '法律、公正' },
  { id: 'root-leg', root: 'leg', variants: ['leg', 'legis'], zh: '法律', group: '社 · 法 · 治', meaning: '法律、法令' },
  { id: 'root-milit', root: 'milit', variants: ['milit', 'militar'], zh: '军事', group: '社 · 法 · 治', meaning: '军事、士兵' },
  { id: 'root-nomin', root: 'nomin', variants: ['nomin', 'nom'], zh: '名字', group: '社 · 法 · 治', meaning: '名字、名称' },
  { id: 'root-polit', root: 'polit', variants: ['polit', 'polic'], zh: '城邦/政治', group: '社 · 法 · 治', meaning: '城邦、政治' },
  { id: 'root-popul', root: 'popul', variants: ['popul', 'publ', 'pop'], zh: '人民/民众', group: '社 · 法 · 治', meaning: '人民、民众' },
  { id: 'root-reg', root: 'reg', variants: ['reg', 'rect', 'rig', 'roy', 'rul'], zh: '统治/直', group: '社 · 法 · 治', meaning: '统治、使直、纠正' },
  { id: 'root-serv', root: 'serv', variants: ['serv', 'servat'], zh: '服务/保存', group: '社 · 法 · 治', meaning: '服务、保存' },
  { id: 'root-soci', root: 'soci', variants: ['soci', 'socio'], zh: '同伴/社会', group: '社 · 法 · 治', meaning: '同伴、社会' },
  { id: 'root-vic', root: 'vic', variants: ['vic', 'vinc', 'vict'], zh: '征服', group: '社 · 法 · 治', meaning: '征服、胜利' },

  // === 自 · 物 · 地 ===
  { id: 'root-aster', root: 'aster', variants: ['aster', 'astro', 'stell'], zh: '星', group: '自 · 物 · 地', meaning: '星' },
  { id: 'root-cycl', root: 'cycl', variants: ['cycl', 'cyc', 'cycle'], zh: '圆/环', group: '自 · 物 · 地', meaning: '圆、环、循环' },
  { id: 'root-dynam', root: 'dynam', variants: ['dynam', 'dynamo', 'dyn'], zh: '力/动力', group: '自 · 物 · 地', meaning: '力量、动力' },
  { id: 'root-gram', root: 'gram', variants: ['gram', 'gramm'], zh: '写/文字', group: '说 · 写 · 画', meaning: '写、文字、记录' },
  { id: 'root-meter', root: 'meter', variants: ['meter', 'metr', 'metri', 'measur'], zh: '测量', group: '状 · 量 · 规', meaning: '测量、度量' },
  { id: 'root-scop', root: 'scop', variants: ['scop', 'scope', 'scopy'], zh: '看/镜', group: '看 · 光 · 声', meaning: '看、观察、镜' },
  { id: 'root-techn', root: 'techn', variants: ['techn', 'techno'], zh: '技艺', group: '自 · 物 · 地', meaning: '技术、技艺' },
  { id: 'root-therm', root: 'therm', variants: ['therm', 'thermo'], zh: '热', group: '自 · 物 · 地', meaning: '热' },
  { id: 'root-typ', root: 'typ', variants: ['typ', 'type'], zh: '类型/打印', group: '自 · 物 · 地', meaning: '类型、印刷' },

  // === 高频补强(第二轮:覆盖派生词干) ===
  { id: 'root-oper', root: 'oper', variants: ['oper', 'opera', 'opus'], zh: '工作', group: '建 · 构 · 放', meaning: '工作、劳动' },
  { id: 'root-minist', root: 'minist', variants: ['minist', 'minister', 'ministr'], zh: '服务/管理', group: '社 · 法 · 治', meaning: '服务、管理' },
  { id: 'root-clud', root: 'clud', variants: ['clud', 'clus', 'clude', 'close'], zh: '关闭', group: '建 · 构 · 放', meaning: '关闭、封闭' },
  { id: 'root-solv', root: 'solv', variants: ['solv', 'solut', 'solve', 'solute'], zh: '松开/解决', group: '转 · 动 · 推', meaning: '松开、解决' },
  { id: 'root-sect', root: 'sect', variants: ['sect', 'seg', 'sec'], zh: '切', group: '转 · 动 · 推', meaning: '切、割、分' },
  { id: 'root-sequ', root: 'sequ', variants: ['sequ', 'secut', 'ecut'], zh: '跟随', group: '运 · 携 · 行', meaning: '跟随、接着' },
  { id: 'root-fid', root: 'fid', variants: ['fid', 'fide', 'faith'], zh: '信任', group: '心 · 知 · 感', meaning: '信任、相信' },
  { id: 'root-flict', root: 'flict', variants: ['flict'], zh: '打击', group: '转 · 动 · 推', meaning: '打击、冲突' },
  { id: 'root-caus', root: 'caus', variants: ['caus', 'cause', 'cuse'], zh: '原因', group: '社 · 法 · 治', meaning: '原因、理由' },
  { id: 'root-mand', root: 'mand', variants: ['mand', 'mend'], zh: '命令', group: '社 · 法 · 治', meaning: '命令、委托' },
  { id: 'root-cult', root: 'cult', variants: ['cult', 'cultiv'], zh: '耕/培养', group: '自 · 物 · 地', meaning: '耕作、培养' },
  { id: 'root-medi', root: 'medi', variants: ['medi', 'med', 'middle'], zh: '中间', group: '时 · 序 · 位', meaning: '中间、居中' },
  { id: 'root-urb', root: 'urb', variants: ['urb', 'urban'], zh: '城市', group: '自 · 物 · 地', meaning: '城市' },
  { id: 'root-labor', root: 'labor', variants: ['labor', 'labour', 'laborat'], zh: '工作', group: '建 · 构 · 放', meaning: '工作、劳动' },
  { id: 'root-cent', root: 'cent', variants: ['cent', 'centi'], zh: '百', group: '状 · 量 · 规', meaning: '百、百分之一' },
  { id: 'root-cruc', root: 'cruc', variants: ['cruc', 'cruci'], zh: '十字/关键', group: '自 · 物 · 地', meaning: '十字、关键' },

  // === 第三轮:高频拉丁/希腊词根补强(提升真词根覆盖率) ===
  // 取 · 手 · 力
  { id: 'root-sum', root: 'sum', variants: ['sume', 'sumpt'], zh: '取/拿', group: '取 · 手 · 力', meaning: '拿取、消耗' },
  { id: 'root-part', root: 'part', variants: ['part', 'parti'], zh: '部分/分开', group: '取 · 手 · 力', meaning: '部分、分开' },
  { id: 'root-pet', root: 'pet', variants: ['pete', 'peat', 'petit', 'petite'], zh: '寻求/追求', group: '取 · 手 · 力', meaning: '寻求、追求' },

  // 心 · 知 · 感
  { id: 'root-not', root: 'note', variants: ['note', 'noti', 'notic'], zh: '标记/知道', group: '心 · 知 · 感', meaning: '标记、知道' },
  { id: 'root-put', root: 'put', variants: ['pute', 'putat'], zh: '思考/计算', group: '心 · 知 · 感', meaning: '思考、计算' },
  { id: 'root-test', root: 'test', variants: ['test'], zh: '作证', group: '心 · 知 · 感', meaning: '证明、作证' },
  { id: 'root-opt', root: 'opt', variants: ['opt', 'opti', 'optic'], zh: '选择/看', group: '心 · 知 · 感', meaning: '选择、眼睛' },
  { id: 'root-noc', root: 'noc', variants: ['noc', 'nox'], zh: '害', group: '心 · 知 · 感', meaning: '伤害、有害' },
  { id: 'root-vol', root: 'vol', variants: ['volunt', 'voli'], zh: '意愿', group: '心 · 知 · 感', meaning: '意愿、意志' },
  { id: 'root-cure', root: 'cure', variants: ['cure', 'curi'], zh: '关心/治疗', group: '心 · 知 · 感', meaning: '关心、治疗' },
  { id: 'root-mon', root: 'mon', variants: ['monit'], zh: '警告', group: '心 · 知 · 感', meaning: '警告、提醒' },

  // 转 · 动 · 推
  { id: 'root-fus', root: 'fus', variants: ['fus', 'fuse', 'fusiv'], zh: '倾倒/融合', group: '转 · 动 · 推', meaning: '倾倒、融合' },
  { id: 'root-flect', root: 'flect', variants: ['flect', 'flex'], zh: '弯曲', group: '转 · 动 · 推', meaning: '弯曲' },
  { id: 'root-fract', root: 'fract', variants: ['fract', 'frag'], zh: '打破', group: '转 · 动 · 推', meaning: '打破、碎裂' },
  { id: 'root-tort', root: 'tort', variants: ['tort', 'tors', 'tortu'], zh: '扭曲', group: '转 · 动 · 推', meaning: '扭曲、转动' },
  { id: 'root-turb', root: 'turb', variants: ['turb'], zh: '扰乱', group: '转 · 动 · 推', meaning: '扰乱、骚动' },
  { id: 'root-string', root: 'strict', variants: ['string', 'strict', 'strain', 'stress'], zh: '拉紧', group: '转 · 动 · 推', meaning: '拉紧、束缚' },
  { id: 'root-surg', root: 'surg', variants: ['surge', 'source', 'sourc'], zh: '升起', group: '转 · 动 · 推', meaning: '升起、涌出' },
  { id: 'root-fend', root: 'fend', variants: ['fend', 'fens', 'fence'], zh: '打击', group: '转 · 动 · 推', meaning: '打击、防御' },
  { id: 'root-cad', root: 'cad', variants: ['cad', 'cas', 'cay', 'case'], zh: '落下', group: '转 · 动 · 推', meaning: '落下、发生' },

  // 建 · 构 · 放
  { id: 'root-mod', root: 'mod', variants: ['mod', 'mode', 'moder', 'modul'], zh: '方式/尺度', group: '建 · 构 · 放', meaning: '方式、尺度、调节' },
  { id: 'root-fund', root: 'fund', variants: ['fund', 'found'], zh: '底/倒', group: '建 · 构 · 放', meaning: '底部、奠定' },

  // 说 · 写 · 画
  { id: 'root-sign', root: 'sign', variants: ['sign', 'signa', 'signi'], zh: '标记', group: '说 · 写 · 画', meaning: '标记、符号' },
  { id: 'root-text', root: 'text', variants: ['text'], zh: '编织', group: '说 · 写 · 画', meaning: '编织、文本' },
  { id: 'root-onym', root: 'onym', variants: ['onym', 'onom', 'nym'], zh: '名', group: '说 · 写 · 画', meaning: '名字' },
  { id: 'root-plaud', root: 'plaud', variants: ['plaud', 'plaus'], zh: '拍/喝彩', group: '说 · 写 · 画', meaning: '拍手、喝彩' },

  // 社 · 法 · 治
  { id: 'root-jud', root: 'jud', variants: ['judg', 'judge', 'judic'], zh: '判断', group: '社 · 法 · 治', meaning: '判断、审判' },
  { id: 'root-liber', root: 'liber', variants: ['liber', 'liberat'], zh: '自由', group: '社 · 法 · 治', meaning: '自由' },
  { id: 'root-neg', root: 'neg', variants: ['neg', 'negat'], zh: '否定', group: '社 · 法 · 治', meaning: '否定' },
  { id: 'root-sacr', root: 'sacr', variants: ['sacr', 'sacri', 'sanc', 'saint'], zh: '神圣', group: '社 · 法 · 治', meaning: '神圣' },
  { id: 'root-mer', root: 'merc', variants: ['merc', 'merce', 'merch'], zh: '商业', group: '社 · 法 · 治', meaning: '商业、交易' },
  { id: 'root-trib', root: 'trib', variants: ['trib', 'tribut', 'tribute'], zh: '给予', group: '社 · 法 · 治', meaning: '给予、分配' },
  { id: 'root-priv', root: 'priv', variants: ['priv'], zh: '私人', group: '社 · 法 · 治', meaning: '私人、私有' },

  // 状 · 量 · 规
  { id: 'root-prim', root: 'prim', variants: ['prim', 'prime', 'primar', 'prima'], zh: '第一/首要', group: '状 · 量 · 规', meaning: '第一、首要' },
  { id: 'root-fort', root: 'fort', variants: ['fort', 'forc', 'force'], zh: '强', group: '状 · 量 · 规', meaning: '强、力' },
  { id: 'root-preci', root: 'preci', variants: ['preci', 'price'], zh: '价值', group: '状 · 量 · 规', meaning: '价值、价格' },
  { id: 'root-vac', root: 'vac', variants: ['vac', 'vacu', 'vacat'], zh: '空', group: '状 · 量 · 规', meaning: '空' },
  { id: 'root-punct', root: 'punct', variants: ['punct', 'point'], zh: '点', group: '状 · 量 · 规', meaning: '点、刺' },

  // 时 · 序 · 位
  { id: 'root-junct', root: 'junct', variants: ['junct', 'join', 'joint'], zh: '连接', group: '时 · 序 · 位', meaning: '连接、结合' },

  // 生 · 身 · 死

  // 自 · 物 · 地
  { id: 'root-mar', root: 'mar', variants: ['mar', 'mari', 'marin'], zh: '海', group: '自 · 物 · 地', meaning: '海' },
  { id: 'root-grav', root: 'grav', variants: ['grav', 'gravi'], zh: '重', group: '自 · 物 · 地', meaning: '重' },
  { id: 'root-radi', root: 'radi', variants: ['radi', 'radio'], zh: '射线', group: '自 · 物 · 地', meaning: '射线、辐射' },

  // === 第四轮:更高频词族补强 ===
  // 建 · 构 · 放
  { id: 'root-cre', root: 'cre', variants: ['cre', 'creat', 'crease', 'cresc'], zh: '生长/创造', group: '建 · 构 · 放', meaning: '生长、创造' },
  { id: 'root-centr', root: 'centr', variants: ['centr', 'center'], zh: '中心', group: '时 · 序 · 位', meaning: '中心' },
  { id: 'root-firm', root: 'firm', variants: ['firm', 'firmat'], zh: '坚固', group: '状 · 量 · 规', meaning: '坚固、确认' },
  { id: 'root-capit', root: 'capit', variants: ['capit', 'capital'], zh: '头/首要', group: '生 · 身 · 死', meaning: '头、首要' },

  // 运 · 携 · 行
  { id: 'root-gest', root: 'gest', variants: ['gest'], zh: '携带/传送', group: '运 · 携 · 行', meaning: '携带、传送' },
  { id: 'root-err', root: 'err', variants: ['err'], zh: '走/迷', group: '运 · 携 · 行', meaning: '走失、出错' },
  { id: 'root-celer', root: 'celer', variants: ['celer'], zh: '快', group: '运 · 携 · 行', meaning: '快速' },
  { id: 'root-laps', root: 'laps', variants: ['lapse', 'laps'], zh: '滑落', group: '运 · 携 · 行', meaning: '滑落、流逝' },

  // 取 · 手 · 力
  { id: 'root-don', root: 'don', variants: ['don', 'donat'], zh: '给予', group: '取 · 手 · 力', meaning: '给予' },
  { id: 'root-vest', root: 'vest', variants: ['vest'], zh: '衣/授予', group: '取 · 手 · 力', meaning: '衣服、授予' },

  // 心 · 知 · 感
  { id: 'root-grat', root: 'grat', variants: ['grat', 'grate', 'grace', 'grac'], zh: '感激/愉悦', group: '心 · 知 · 感', meaning: '感激、愉悦' },
  { id: 'root-plac', root: 'plac', variants: ['pleas', 'please', 'plac'], zh: '愉悦', group: '心 · 知 · 感', meaning: '愉悦、取悦' },
  { id: 'root-horr', root: 'horr', variants: ['horr'], zh: '发抖/恐惧', group: '心 · 知 · 感', meaning: '发抖、恐惧' },
  { id: 'root-fam', root: 'fam', variants: ['fam', 'fant', 'fame'], zh: '说/名声', group: '说 · 写 · 画', meaning: '说话、名声' },

  // 社 · 法 · 治
  { id: 'root-crim', root: 'crim', variants: ['crime', 'crimin'], zh: '罪/指控', group: '社 · 法 · 治', meaning: '罪、指控' },
  { id: 'root-rang', root: 'rang', variants: ['rang', 'range'], zh: '排列', group: '社 · 法 · 治', meaning: '排列、整理' },

  // 生 · 身 · 死
  { id: 'root-hum', root: 'hum', variants: ['human', 'humili'], zh: '地/人', group: '生 · 身 · 死', meaning: '土地、人' },
  { id: 'root-nutri', root: 'nutri', variants: ['nutri', 'nurt', 'nurse'], zh: '滋养', group: '生 · 身 · 死', meaning: '滋养、养育' },

  // 时 · 序 · 位
  { id: 'root-journ', root: 'journ', variants: ['journ', 'journal'], zh: '日', group: '时 · 序 · 位', meaning: '日子、每日' },

  // 自 · 物 · 地
  { id: 'root-insul', root: 'insul', variants: ['insul', 'insula', 'isol'], zh: '岛', group: '自 · 物 · 地', meaning: '岛、孤立' },
  { id: 'root-circ', root: 'circ', variants: ['circul', 'circle', 'circus', 'circuit'], zh: '圆/环', group: '自 · 物 · 地', meaning: '圆、环' },
  { id: 'root-fig', root: 'fig', variants: ['figure', 'fict'], zh: '塑造', group: '建 · 构 · 放', meaning: '塑造、形象' },

  // 动 · 变
  { id: 'root-pand', root: 'pand', variants: ['pand', 'pans'], zh: '展开', group: '转 · 动 · 推', meaning: '展开、扩张' },

  // === 第五轮:补齐拆解缺口(前缀剥离后找不到词根的词) ===
  // 取 · 手 · 力
  { id: 'root-sorb', root: 'sorb', variants: ['sorb', 'sorpt'], zh: '吸', group: '取 · 手 · 力', meaning: '吸收、吞入' },
  { id: 'root-cumul', root: 'cumul', variants: ['cumul'], zh: '堆积', group: '取 · 手 · 力', meaning: '堆积、累积' },

  // 运 · 携 · 行
  { id: 'root-vant', root: 'vant', variants: ['vant', 'vanc'], zh: '前/先', group: '运 · 携 · 行', meaning: '在前、领先' },
  { id: 'root-nav', root: 'nav', variants: ['nav', 'naut'], zh: '船', group: '运 · 携 · 行', meaning: '船、航行' },
  { id: 'root-vad', root: 'vad', variants: ['vad', 'vas'], zh: '走/行', group: '运 · 携 · 行', meaning: '行走、前进' },
  { id: 'root-lev', root: 'lev', variants: ['lev'], zh: '举起/轻', group: '运 · 携 · 行', meaning: '举起、轻' },

  // 心 · 知 · 感
  { id: 'root-cord', root: 'cord', variants: ['cord', 'cardi'], zh: '心', group: '心 · 知 · 感', meaning: '心、心脏' },
  { id: 'root-var', root: 'var', variants: ['var', 'vari'], zh: '变化', group: '心 · 知 · 感', meaning: '变化、不同' },

  // 状 · 量 · 规
  { id: 'root-clin', root: 'clin', variants: ['clin'], zh: '倾斜', group: '状 · 量 · 规', meaning: '倾斜、倾向' },

  // 说 · 写 · 画
  { id: 'root-liter', root: 'liter', variants: ['liter', 'litter'], zh: '字母/文字', group: '说 · 写 · 画', meaning: '字母、文字' },

  // 生 · 身 · 死
  { id: 'root-derm', root: 'derm', variants: ['derm', 'dermat'], zh: '皮', group: '生 · 身 · 死', meaning: '皮肤' },
  { id: 'root-mater', root: 'mater', variants: ['mater', 'matr'], zh: '母', group: '生 · 身 · 死', meaning: '母亲、母' },

  // 自 · 物 · 地
  // 原本标的是「地」(terra),但语料里没有任何 terra 词是可拆的(terrace/territory 都拆不动),
  // 而 terr 实际只被 terrere(恐吓)一族命中:terror/terrible/terrify/terribly。
  // 词根义必须与它真正管的词一致,否则整族词的释义都是错的。故按 terrere 立根。
  { id: 'root-terr', root: 'terr', variants: ['terr'], zh: '恐吓', group: '心 · 知 · 感', meaning: '使恐惧、惊吓' },

  // 社 · 法 · 治
];

// —— 追加词缀 ——
const extraAffixes = [
  // 前缀
  { id: 'affix-un', text: 'un-', type: 'prefix', group: '否定 · 相反', zh: '不/相反', note: '如 unhappy(不快乐)、undo(撤销)。' },
  { id: 'affix-ir', text: 'ir-', type: 'prefix', group: '否定 · 相反', zh: '不/进入', note: 'in- 在 r 前的变体,如 irregular(不规则的)。' },
  { id: 'affix-super', text: 'super-', type: 'prefix', group: '数量 · 程度', zh: '超过/在上', note: '如 supermarket(超市)、superior(上等的)。' },
  { id: 'affix-anti', text: 'anti-', type: 'prefix', group: '否定 · 相反', zh: '反对/抵抗', note: '如 antibody(抗体)。' },
  { id: 'affix-bi', text: 'bi-', type: 'prefix', group: '数量 · 程度', zh: '二/两', note: '如 bicycle(自行车)。' },
  { id: 'affix-co', text: 'co-', type: 'prefix', group: '共同 · 相互', zh: '共同', note: '如 cooperate(合作)。' },
  { id: 'affix-counter', text: 'counter-', type: 'prefix', group: '否定 · 相反', zh: '相反/对抗', note: '如 counterattack(反击)。' },
  { id: 'affix-fore', text: 'fore-', type: 'prefix', group: '时间 · 次序', zh: '在前/预先', note: '如 forecast(预报)、forehead(前额)。' },
  { id: 'affix-mis', text: 'mis-', type: 'prefix', group: '否定 · 相反', zh: '错/坏', note: '如 misunderstand(误解)。' },
  { id: 'affix-non', text: 'non-', type: 'prefix', group: '否定 · 相反', zh: '非/无', note: '如 nonsense(胡说)。' },
  { id: 'affix-over', text: 'over-', type: 'prefix', group: '数量 · 程度', zh: '过度/在上', note: '如 overcome(克服)、overwork(过度工作)。' },
  { id: 'affix-semi', text: 'semi-', type: 'prefix', group: '数量 · 程度', zh: '半', note: '如 semifinal(半决赛)。' },
  { id: 'affix-tri', text: 'tri-', type: 'prefix', group: '数量 · 程度', zh: '三', note: '如 triangle(三角形)。' },
  { id: 'affix-under', text: 'under-', type: 'prefix', group: '方向 · 位置', zh: '在下/不足', note: '如 underline(下划线)、underestimate(低估)。' },
  { id: 'affix-en', text: 'en-', type: 'prefix', group: '方向 · 位置', zh: '使/进入', note: '如 enable(使能够)、encourage(鼓励)。' },
  { id: 'affix-em', text: 'em-', type: 'prefix', group: '方向 · 位置', zh: '使/进入', note: 'en- 在 b/m/p 前的变体,如 employ(雇用)。' },
  { id: 'affix-ac', text: 'ac-', type: 'prefix', group: '方向 · 位置', zh: '朝向/加强', note: 'ad- 在 c/k/q 前的同化,如 accept(接受)。' },
  { id: 'affix-af', text: 'af-', type: 'prefix', group: '方向 · 位置', zh: '朝向/加强', note: 'ad- 在 f 前的同化,如 affect(影响)。' },
  { id: 'affix-ag', text: 'ag-', type: 'prefix', group: '方向 · 位置', zh: '朝向/加强', note: 'ad- 在 g 前的同化,如 aggressive(进取的)。' },
  { id: 'affix-al-prefix', text: 'al-', type: 'prefix', group: '方向 · 位置', zh: '朝向/加强', note: 'ad- 在 l 前的同化,如 allocate(分配)。' },
  { id: 'affix-an', text: 'an-', type: 'prefix', group: '方向 · 位置', zh: '朝向/加强', note: 'ad- 在 n 前的同化,如 announce(宣布)。' },
  { id: 'affix-ap', text: 'ap-', type: 'prefix', group: '方向 · 位置', zh: '朝向/加强', note: 'ad- 在 p 前的同化,如 apply(应用)。' },
  { id: 'affix-ar', text: 'ar-', type: 'prefix', group: '方向 · 位置', zh: '朝向/加强', note: 'ad- 在 r 前的同化,如 arrive(到达)。' },
  { id: 'affix-as', text: 'as-', type: 'prefix', group: '方向 · 位置', zh: '朝向/加强', note: 'ad- 在 s 前的同化,如 assist(协助)。' },
  { id: 'affix-at', text: 'at-', type: 'prefix', group: '方向 · 位置', zh: '朝向/加强', note: 'ad- 在 t 前的同化,如 attract(吸引)。' },
  { id: 'affix-col', text: 'col-', type: 'prefix', group: '共同 · 相互', zh: '共同/加强', note: 'con- 在 l 前的同化,如 collect(收集)。' },
  { id: 'affix-cor', text: 'cor-', type: 'prefix', group: '共同 · 相互', zh: '共同/加强', note: 'con- 在 r 前的同化,如 correct(纠正)。' },
  { id: 'affix-ef', text: 'ef-', type: 'prefix', group: '方向 · 位置', zh: '出/向外', note: 'ex- 在 f 前的同化,如 effect(效果)。' },
  { id: 'affix-dif', text: 'dif-', type: 'prefix', group: '否定 · 相反', zh: '分开/否定', note: 'dis- 在 f 前的同化,如 differ(不同)。' },
  { id: 'affix-of', text: 'of-', type: 'prefix', group: '方向 · 位置', zh: '朝向/加强', note: 'ob- 在 f 前的同化,如 offend(冒犯)。' },
  { id: 'affix-op', text: 'op-', type: 'prefix', group: '否定 · 相反', zh: '朝向/相对', note: 'ob- 在 p 前的同化,如 oppose(反对)、oppress(压迫)。' },
  { id: 'affix-suc', text: 'suc-', type: 'prefix', group: '方向 · 位置', zh: '在下/次级', note: 'sub- 在 c 前的同化,如 succeed(成功)。' },
  { id: 'affix-suf', text: 'suf-', type: 'prefix', group: '方向 · 位置', zh: '在下/次级', note: 'sub- 在 f 前的同化,如 suffer(遭受)。' },
  { id: 'affix-sug', text: 'sug-', type: 'prefix', group: '方向 · 位置', zh: '在下/次级', note: 'sub- 在 g 前的同化,如 suggest(建议)。' },
  { id: 'affix-sup', text: 'sup-', type: 'prefix', group: '方向 · 位置', zh: '在下/次级', note: 'sub- 在 p 前的同化,如 support(支持)。' },
  { id: 'affix-sur', text: 'sur-', type: 'prefix', group: '方向 · 位置', zh: '超过/在上', note: '如 surface(表面)、surplus(剩余)。' },
  { id: 'affix-sus', text: 'sus-', type: 'prefix', group: '方向 · 位置', zh: '在下/次级', note: 'sub- 的变体,如 suspend(悬挂)。' },
  { id: 'affix-se', text: 'se-', type: 'prefix', group: '否定 · 相反', zh: '分开/离开', note: '如 separate(分开)。' },
  { id: 'affix-extra', text: 'extra-', type: 'prefix', group: '数量 · 程度', zh: '超出/额外', note: '如 extraordinary(非凡的)。' },
  { id: 'affix-mult', text: 'multi-', type: 'prefix', group: '数量 · 程度', zh: '多', note: '如 multimedia(多媒体)。' },
  { id: 'affix-pan', text: 'pan-', type: 'prefix', group: '数量 · 程度', zh: '全/泛', note: '如 panorama(全景)。' },
  { id: 'affix-poly', text: 'poly-', type: 'prefix', group: '数量 · 程度', zh: '多', note: '如 polygon(多边形)。' },
  { id: 'affix-pseudo', text: 'pseudo-', type: 'prefix', group: '否定 · 相反', zh: '假/伪', note: '如 pseudonym(化名)。' },
  { id: 'affix-vice', text: 'vice-', type: 'prefix', group: '学科 · 其他', zh: '副/次', note: '如 vice-president(副总统)。' },

  // 后缀
  { id: 'affix-tion', text: '-tion', type: 'suffix', group: '名词', zh: '名词后缀(表行为/状态/结果)', note: '如 action、nation。-ion 家族。' },
  { id: 'affix-sion', text: '-sion', type: 'suffix', group: '名词', zh: '名词后缀(表行为/状态)', note: '如 decision、vision。-ion 家族。' },
  { id: 'affix-ness', text: '-ness', type: 'suffix', group: '名词', zh: '名词后缀(表性质/状态)', note: '如 happiness(幸福)、kindness(善意)。' },
  { id: 'affix-ity', text: '-ity', type: 'suffix', group: '名词', zh: '名词后缀(表性质/状态)', note: '如 activity(活动)、ability(能力)。' },
  { id: 'affix-less', text: '-less', type: 'suffix', group: '形容词', zh: '无…的(形容词)', note: '如 hopeless(无望的)。' },
  { id: 'affix-ize', text: '-ize', type: 'suffix', group: '动词', zh: '(使…)动词后缀', note: '如 realize(实现)、organize(组织)。' },
  { id: 'affix-ify', text: '-ify', type: 'suffix', group: '动词', zh: '(使…)动词后缀', note: '如 simplify(简化)。' },
  { id: 'affix-er', text: '-er', type: 'suffix', group: '表「…者 / …物」', zh: '…者/…物(名词)', note: '如 teacher(教师)、worker(工人)。' },
  { id: 'affix-ist', text: '-ist', type: 'suffix', group: '表「…者 / …物」', zh: '…者(名词)', note: '如 scientist(科学家)。' },
  { id: 'affix-ance', text: '-ance', type: 'suffix', group: '名词', zh: '名词后缀(表性质/状态)', note: '如 importance(重要性)。' },
  { id: 'affix-ant', text: '-ant', type: 'suffix', group: '形容词', zh: '…的(形容词)/…者(名词)', note: '如 important(重要的)。' },
  { id: 'affix-ty', text: '-ty', type: 'suffix', group: '名词', zh: '名词后缀(表性质/状态)', note: '如 safety(安全)、loyalty(忠诚)。' },
  { id: 'affix-th', text: '-th', type: 'suffix', group: '名词', zh: '名词后缀(表性质/状态)', note: '如 truth(真相)、warmth(温暖)。' },
  { id: 'affix-ship', text: '-ship', type: 'suffix', group: '名词', zh: '名词后缀(表身份/关系/状态)', note: '如 friendship(友谊)。' },
  { id: 'affix-hood', text: '-hood', type: 'suffix', group: '名词', zh: '名词后缀(表身份/时期/状态)', note: '如 childhood(童年)。' },
  { id: 'affix-dom', text: '-dom', type: 'suffix', group: '名词', zh: '名词后缀(表状态/领域)', note: '如 freedom(自由)、kingdom(王国)。' },
  { id: 'affix-ism', text: '-ism', type: 'suffix', group: '名词', zh: '名词后缀(表主义/学说)', note: '如 socialism(社会主义)。' },
  { id: 'affix-ern', text: '-ern', type: 'suffix', group: '形容词', zh: '…的(形容词,表方位)', note: '如 eastern(东方的)。' },
  { id: 'affix-ish', text: '-ish', type: 'suffix', group: '形容词', zh: '…的/略…的(形容词)', note: '如 foolish(愚蠢的)。' },
  { id: 'affix-ward', text: '-ward', type: 'suffix', group: '形容词', zh: '向…的(形容词/副词)', note: '如 backward(向后的)。' },
  { id: 'affix-ly', text: '-ly', type: 'suffix', group: '副词', zh: '…地(副词)', note: '如 quickly(快速地)。' },
  { id: 'affix-en-verb', text: '-en', type: 'suffix', group: '动词', zh: '(使…)动词后缀', note: '如 strengthen(加强)。' },
  { id: 'affix-ing', text: '-ing', type: 'suffix', group: '动词', zh: '现在分词/动名词后缀', note: '如 running(跑步)。' },
  { id: 'affix-ed', text: '-ed', type: 'suffix', group: '动词', zh: '过去式/过去分词/形容词后缀', note: '如 decided(已决定的)。' },
  { id: 'affix-es', text: '-es', type: 'suffix', group: '名词', zh: '复数/三单后缀', note: '如 watches、boxes。' },
  { id: 'affix-s', text: '-s', type: 'suffix', group: '名词', zh: '复数/三单后缀', note: '如 cats、runs。' },
  { id: 'affix-est', text: '-est', type: 'suffix', group: '形容词', zh: '最高级后缀', note: '如 biggest(最大的)。' },
  { id: 'affix-ience', text: '-ience', type: 'suffix', group: '名词', zh: '名词后缀(表性质/状态)', note: '如 audience(听众)、experience(经验)。' },
  { id: 'affix-ient', text: '-ient', type: 'suffix', group: '形容词', zh: '…的(形容词)', note: '如 patient(耐心的)、efficient(高效的)。' },
  { id: 'affix-ee', text: '-ee', type: 'suffix', group: '表「…者 / …物」', zh: '受动者(名词)', note: '如 employee(雇员)、trainee(受训者)。' },
  { id: 'affix-an-suffix', text: '-an', type: 'suffix', group: '形容词', zh: '…的/…人(形容词/名词)', note: '如 American(美国的/美国人)、urban(城市的)。' },
  { id: 'affix-ine', text: '-ine', type: 'suffix', group: '形容词', zh: '…的(形容词)', note: '如 genuine(真正的)、marine(海的)。' },
  { id: 'affix-be', text: 'be-', type: 'prefix', group: '方向 · 位置', zh: '使/在/遍及', note: '如 because(因为)、become(变成)、behave(表现)。' },
  { id: 'affix-out', text: 'out-', type: 'prefix', group: '方向 · 位置', zh: '向外/超过', note: '如 outline(轮廓)、outstanding(杰出的)、output(输出)。' },
  { id: 'affix-ial', text: '-ial', type: 'suffix', group: '形容词', zh: '…的(形容词)', note: '如 social(社会的)、financial(财政的)、industrial(工业的)。' },
  { id: 'affix-ious', text: '-ious', type: 'suffix', group: '形容词', zh: '…的(形容词)', note: '如 various(多样的)、previous(先前的)、obvious(明显的)。' },
  { id: 'affix-ency', text: '-ency', type: 'suffix', group: '名词', zh: '名词后缀(表性质/状态)', note: '如 frequency(频率)、efficiency(效率)、tendency(倾向)。' },
  { id: 'affix-ative', text: '-ative', type: 'suffix', group: '形容词', zh: '有…性质的(形容词)', note: '如 alternative(替代的)、representative(代表性的)。' },
  { id: 'affix-ivity', text: '-ivity', type: 'suffix', group: '名词', zh: '名词后缀(表性质/状态)', note: '如 activity(活动)、productivity(生产力)。' },
  { id: 'affix-logy', text: '-logy', type: 'suffix', group: '名词', zh: '学科/…学(名词)', note: '如 biology(生物学)、psychology(心理学)、technology(技术)。' },
  { id: 'affix-age', text: '-age', type: 'suffix', group: '名词', zh: '名词后缀(表行为/集合/状态)', note: '如 package(包裹)、marriage(婚姻)、storage(储存)。' },
];

// 扩充 base 词根的拼写变体(过去分词/名词化/元音交替等形式)。
// 不直接改 miniprogram/data/roots.js,在这里做变体富化,保证小程序 30 根不被改动。
const baseVariantExtras = {
  'root-spect': ['spic'],
  // vey(convey/survey)源自 via「路」,归 root-vect;root-vis(看)不接管。
  'root-vis': ['view', 'vide', 'vise', 'visor'],
  'root-scrib': ['scrip', 'scribe'],
  'root-dict': ['dictate'],
  'root-duc': ['duce'],
  'root-mit': ['mitt'],
  'root-struct': ['stroy'],
  'root-tract': ['treat', 'trait'],
  'root-vert': ['verse', 'versa', 'verti'],
  'root-form': ['format'],
  'root-grad': ['grade'],
  'root-ced': ['cede'],
  'root-pend': ['pense'],
  'root-pos': ['posit', 'pose', 'pone', 'pound', 'posite'],
  'root-tend': ['tense'],
  'root-cept': ['ceive', 'cap', 'capt', 'cup'],
  'root-ven': ['vene'],
  'root-pel': ['pulse', 'peal'],
  'root-val': ['valu'],
  'root-phon': ['phone'],
  // gram(写/文字)有独立的 root-gram,不再挂到 root-graph 下争用。
  'root-graph': ['graphic'],
  'root-log': ['logy'],
  'root-mob': ['move', 'mote'],
  'root-nov': ['novel'],
  'root-numer': ['number'],
};

const enrichedBaseRoots = baseRoots.map((r) => {
  const extra = baseVariantExtras[r.id] || [];
  return { ...r, variants: [...(r.variants || []), ...extra] };
});

// in- 的「方向」义与「否定」义在手写基础数据里是两条(affix-in / affix-in-neg)。
// 生成器对同形词缀建索引是 first-wins,两条并存会导致**所有** in- 段都被标成前者
// ——independent 会显示成「进入 + de + pend + ent」,是可见的语义错误。
// 这里在导出边界合并成一条(zh/note 同时覆盖两义)。不改 miniprogram/data/:
// 那是小程序自带的基础数据,条数被 test/db-content.test.js 锁定(66 条)。
const MERGED_AFFIX_IN = {
  id: 'affix-in',
  text: 'in-',
  type: 'prefix',
  group: '否定 · 相反',
  zh: '不/非;向内',
  note: '两义:①否定「不/非」,如 informal(非正式)、incredible(难以置信);'
    + '②方向「向内/进入」,如 include(包含)、import(进口)。'
    + '在 l/r/b/m/p 前同化为 il-/ir-/im-,如 irregular、impossible。',
};
const mergedBaseAffixes = baseAffixes
  .filter((a) => a.id !== 'affix-in' && a.id !== 'affix-in-neg')
  .concat(MERGED_AFFIX_IN);

module.exports = {
  roots: [...enrichedBaseRoots, ...extraRoots],
  affixes: [...mergedBaseAffixes, ...extraAffixes],
};
