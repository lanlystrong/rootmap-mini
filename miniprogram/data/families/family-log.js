const words = [
  { id: 'logic', word: 'logic', phonetic: '/ˈlɒdʒɪk/',
    senses: [{ pos: 'n.', zh: '逻辑;逻辑学', en: 'the science of correct reasoning; sound judgment' }],
    breakdown: [
      { part: 'log', type: 'root', zh: '话语/理性', refId: 'root-log' },
      { part: 'ic', type: 'suffix', zh: '…学/…的', refId: 'affix-ic' },
    ],
    tags: ['cet4'],
    examples: [
      { en: 'There is no logic in his argument.', zh: '他的论点毫无逻辑。' },
    ],
    assoc: { story: 'log(理性)+ic = 关于正确推理的学问 → 逻辑。' } },
  { id: 'logical', word: 'logical', phonetic: '/ˈlɒdʒɪkl/',
    senses: [{ pos: 'adj.', zh: '合逻辑的;合理的', en: 'reasonable and based on good judgment' }],
    breakdown: [
      { part: 'log', type: 'root', zh: '理性', refId: 'root-log' },
      { part: 'ic', type: 'suffix', zh: '…的', refId: 'affix-ic' },
      { part: 'al', type: 'suffix', zh: '…的', refId: 'affix-al' },
    ],
    tags: ['cet4'],
    examples: [
      { en: 'It is a logical conclusion.', zh: '这是一个合乎逻辑的结论。' },
    ],
    assoc: {} },
  { id: 'dialogue', word: 'dialogue', phonetic: '/ˈdaɪəlɒɡ/',
    senses: [{ pos: 'n.', zh: '对话;对白', en: 'a conversation between two or more people' }],
    breakdown: [
      { part: 'dia', type: 'prefix', zh: '相互/相对', refId: 'affix-dia' },
      { part: 'logue', type: 'root', zh: '话语', refId: 'root-log' },
    ],
    tags: ['cet4', '高频'],
    examples: [
      { en: 'The two sides are trying to start a dialogue.', zh: '双方正设法开启对话。' },
    ],
    assoc: { story: 'dia(相互)+logue(话语) = 两人你一言我一语 → 对话。' } },
  { id: 'catalogue', word: 'catalogue', phonetic: '/ˈkætəlɒɡ/',
    senses: [{ pos: 'n.', zh: '目录;商品目录', en: 'a complete list of items, often with details' },
             { pos: 'v.', zh: '编入目录;记载', en: 'to list things in a catalogue' }],
    breakdown: [
      { part: 'cata', type: 'prefix', zh: '向下/完全', refId: 'affix-cata' },
      { part: 'logue', type: 'root', zh: '话语/罗列', refId: 'root-log' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'Please check the library catalogue online.', zh: '请在图书馆网站上查目录。' },
    ],
    assoc: { story: 'cata(完全)+logue(罗列) = 从头到尾列出来 → 目录。(美式拼作 catalog)' } },
  { id: 'apology', word: 'apology', phonetic: '/əˈpɒlədʒi/',
    senses: [{ pos: 'n.', zh: '道歉;歉意', en: 'a statement saying that you are sorry' }],
    breakdown: [
      { part: 'apo', type: 'prefix', zh: '离开/分开', refId: 'affix-apo' },
      { part: 'log', type: 'root', zh: '话语', refId: 'root-log' },
      { part: 'y', type: 'suffix', zh: '名词后缀', refId: 'affix-y' },
    ],
    tags: ['cet4'],
    examples: [
      { en: 'Please accept my sincere apology.', zh: '请接受我真诚的道歉。' },
    ],
    assoc: { story: 'apo(分开)+log(话语)+y = 为自己的过失把话说开 → 道歉。' } },
  { id: 'monologue', word: 'monologue', phonetic: '/ˈmɒnəlɒɡ/',
    senses: [{ pos: 'n.', zh: '独白;(戏剧中的)长篇台词', en: 'a long speech by one person' }],
    breakdown: [
      { part: 'mono', type: 'prefix', zh: '单一', refId: 'affix-mono' },
      { part: 'logue', type: 'root', zh: '话语', refId: 'root-log' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'The actor delivered a long monologue on stage.', zh: '演员在台上念了一段长长的独白。' },
    ],
    assoc: { story: 'mono(单一)+logue(话语) = 一个人独自说 → 独白。' } },
  { id: 'biology', word: 'biology', phonetic: '/baɪˈɒlədʒi/',
    senses: [{ pos: 'n.', zh: '生物学', en: 'the study of living things' }],
    breakdown: [
      { part: 'bio', type: 'prefix', zh: '生命', refId: 'affix-bio' },
      { part: 'log', type: 'root', zh: '话语/学科', refId: 'root-log' },
      { part: 'y', type: 'suffix', zh: '名词后缀', refId: 'affix-y' },
    ],
    tags: ['cet4'],
    examples: [
      { en: 'She is majoring in biology.', zh: '她主修生物学。' },
    ],
    assoc: { story: 'bio(生命)+log(…学)+y = 研究生命的学科 → 生物学。' } },
];
module.exports = words;
