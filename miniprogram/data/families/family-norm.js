const words = [
  { id: 'normal', word: 'normal', phonetic: '/ˈnɔːml/',
    senses: [{ pos: 'adj.', zh: '正常的;普通的', en: 'usual, typical or expected' }],
    breakdown: [
      { part: 'norm', type: 'root', zh: '规则/标准', refId: 'root-norm' },
      { part: 'al', type: 'suffix', zh: '…的', refId: 'affix-al' },
    ],
    tags: ['cet4', '高频'],
    examples: [
      { en: 'It is normal to feel nervous before an exam.', zh: '考试前感到紧张是正常的。' },
    ],
    assoc: { story: 'norm(标准)+al = 合乎标准的 → 正常的。' } },
  { id: 'abnormal', word: 'abnormal', phonetic: '/æbˈnɔːml/',
    senses: [{ pos: 'adj.', zh: '反常的;异常的', en: 'different from what is normal or usual' }],
    breakdown: [
      { part: 'ab', type: 'prefix', zh: '偏离/离开', refId: 'affix-ab' },
      { part: 'norm', type: 'root', zh: '规则/标准', refId: 'root-norm' },
      { part: 'al', type: 'suffix', zh: '…的', refId: 'affix-al' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'The test showed abnormal cell growth.', zh: '检测显示细胞异常增生。' },
    ],
    assoc: { antonyms: ['normal'], story: 'ab(偏离)+normal(正常的) = 偏离正常的 → 反常的。' } },
  { id: 'enormous', word: 'enormous', phonetic: '/ɪˈnɔːməs/',
    senses: [{ pos: 'adj.', zh: '巨大的;庞大的', en: 'extremely large' }],
    breakdown: [
      { part: 'e', type: 'prefix', zh: '出/超出', refId: 'affix-e' },
      { part: 'norm', type: 'root', zh: '规则/标准', refId: 'root-norm' },
      { part: 'ous', type: 'suffix', zh: '…的', refId: 'affix-ous' },
    ],
    tags: ['cet4'],
    examples: [
      { en: 'They spent an enormous amount of money.', zh: '他们花了一大笔钱。' },
    ],
    assoc: { story: 'e(超出)+norm(常规)+ous = 超出常规大小的 → 巨大的。' } },
  { id: 'norm', word: 'norm', phonetic: '/nɔːm/',
    senses: [{ pos: 'n.', zh: '标准;规范;常态', en: 'a standard or pattern that is typical or expected' }],
    breakdown: [
      { part: 'norm', type: 'root', zh: '规则/标准', refId: 'root-norm' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'Working from home has become the norm.', zh: '居家办公已成为常态。' },
    ],
    assoc: {} },
];
module.exports = words;
