const test = require('node:test');
const assert = require('node:assert');
const fixture = require('./helpers/content-fixture');
const { errorsFor } = require('../scripts/validate-content');

function deepClone(o){ return JSON.parse(JSON.stringify(o)); }

test('合法样本不产生错误', () => {
  assert.deepStrictEqual(errorsFor(deepClone(fixture)), []);
});

test('拼接错误被捕获', () => {
  const d = deepClone(fixture);
  d.words[0].breakdown[0].part = 'ix'; // in+... -> ixspect != inspect
  const errs = errorsFor(d);
  assert.ok(errs.some(e => /inspect/.test(e) && /拼接|concat/i.test(e)));
});

test('assoc 引用不存在或自引用被捕获', () => {
  const d = deepClone(fixture);
  const w = d.words.find(x => x.id === 'respect');
  w.assoc.synonyms = ['no-such-word'];
  const d2 = deepClone(fixture);
  const w2 = d2.words.find(x => x.id === 'respect');
  w2.assoc.synonyms = ['respect'];
  assert.ok(errorsFor(d).some(e => /no-such-word/.test(e)));
  assert.ok(errorsFor(d2).some(e => /自身|self/i.test(e)));
});

test('词根段至多 1 个;整词不可拆解是合法终态', () => {
  // 早期版本要求「恰有 1 个词根段」,但拆解算法对无法拆解的词会整词标记 none
  // (CET4 语料里 4238/5554 都是这种),按「恰有 1 个」会把绝大多数词判为非法。
  // 现行契约是「至多 1 个词根段」,且允许整词 none。
  const d0 = deepClone(fixture);
  d0.words[0].breakdown = [{ part: d0.words[0].word, type: 'none' }];
  assert.deepStrictEqual(errorsFor(d0), []);

  // 两个词根段仍然必须被拦下
  const d2 = deepClone(fixture);
  d2.words[0].breakdown = [
    { part: 'in', type: 'prefix', refId: 'affix-in' },
    { part: 'spect', type: 'root', refId: 'root-spect' },
    { part: '', type: 'root', refId: 'root-spect' },
  ];
  assert.ok(errorsFor(d2).some(e => /词根/.test(e)));
});

test('examples/senses/phonetic 缺失被捕获', () => {
  const d = deepClone(fixture);
  d.words[0].examples = [];
  const d2 = deepClone(fixture);
  d2.words[1].phonetic = '';
  assert.ok(errorsFor(d).some(e => /example/i.test(e)));
  assert.ok(errorsFor(d2).some(e => /phonetic/i.test(e)));
});
