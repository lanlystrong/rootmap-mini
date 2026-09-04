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
