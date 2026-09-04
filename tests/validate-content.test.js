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

test('每词必须恰有一个词根段', () => {
  const d = deepClone(fixture);
  const w = d.words[0];
  w.breakdown = w.breakdown.filter(b => b.type !== 'root');
  assert.ok(errorsFor(d).some(e => /词根/.test(e)));
});

test('examples/senses/phonetic 缺失被捕获', () => {
  const d = deepClone(fixture);
  d.words[0].examples = [];
  const d2 = deepClone(fixture);
  d2.words[1].phonetic = '';
  assert.ok(errorsFor(d).some(e => /example/i.test(e)));
  assert.ok(errorsFor(d2).some(e => /phonetic/i.test(e)));
});
