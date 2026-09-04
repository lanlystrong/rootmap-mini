const words = [
  { id: 'number', word: 'number', phonetic: '/ˈnʌmbə/',
    senses: [{ pos: 'n.', zh: '数字;号码;数量', en: 'a word or symbol used for counting; an amount' },
             { pos: 'v.', zh: '编号;数', en: 'to give a number to something; to count' }],
    breakdown: [
      { part: 'num', type: 'root', zh: '数', refId: 'root-numer' },
      { part: 'ber', type: 'none' },
    ],
    tags: ['cet4', '高频'],
    examples: [
      { en: 'Please write your phone number here.', zh: '请在这里写下你的电话号码。' },
      { en: 'The number of students is increasing.', zh: '学生人数在增加。' },
    ],
    assoc: { story: 'num(数)+ber = 数出来的符号 → 数字、号码。' } },
  { id: 'numerous', word: 'numerous', phonetic: '/ˈnjuːmərəs/',
    senses: [{ pos: 'adj.', zh: '许多的;众多的', en: 'existing in large numbers' }],
    breakdown: [
      { part: 'numer', type: 'root', zh: '数', refId: 'root-numer' },
      { part: 'ous', type: 'suffix', zh: '充满…的', refId: 'affix-ous' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'She has numerous friends around the world.', zh: '她在世界各地有许多朋友。' },
    ],
    assoc: { story: 'numer(数)+ous = 数不过来的 → 众多的。' } },
  { id: 'numerical', word: 'numerical', phonetic: '/njuːˈmerɪkl/',
    senses: [{ pos: 'adj.', zh: '数字的;数值的', en: 'expressed or shown in numbers' }],
    breakdown: [
      { part: 'numer', type: 'root', zh: '数', refId: 'root-numer' },
      { part: 'ic', type: 'suffix', zh: '…的', refId: 'affix-ic' },
      { part: 'al', type: 'suffix', zh: '…的', refId: 'affix-al' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'Put the data in numerical order.', zh: '把数据按数字顺序排列。' },
    ],
    assoc: {} },
  { id: 'enumerate', word: 'enumerate', phonetic: '/ɪˈnjuːməreɪt/',
    senses: [{ pos: 'v.', zh: '列举;枚举', en: 'to name things one by one' }],
    breakdown: [
      { part: 'e', type: 'prefix', zh: '出', refId: 'affix-e' },
      { part: 'numer', type: 'root', zh: '数', refId: 'root-numer' },
      { part: 'ate', type: 'suffix', zh: '动词后缀', refId: 'affix-ate' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'He enumerated the reasons for his decision.', zh: '他逐一列举了自己作此决定的理由。' },
    ],
    assoc: { story: 'e(出)+numer(数)+ate = 一个一个数出来 → 列举。' } },
  { id: 'numeral', word: 'numeral', phonetic: '/ˈnjuːmərəl/',
    senses: [{ pos: 'n.', zh: '数字;数词', en: 'a sign or word that represents a number' },
             { pos: 'adj.', zh: '数字的', en: 'relating to numbers' }],
    breakdown: [
      { part: 'numer', type: 'root', zh: '数', refId: 'root-numer' },
      { part: 'al', type: 'suffix', zh: '…的', refId: 'affix-al' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'The Romans used different numerals.', zh: '罗马人使用不同的数字符号。' },
    ],
    assoc: {} },
];
module.exports = words;
