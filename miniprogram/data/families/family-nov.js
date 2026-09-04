const words = [
  { id: 'novel', word: 'novel', phonetic: '/ˈnɒvəl/',
    senses: [{ pos: 'n.', zh: '(长篇)小说', en: 'a long written story about imaginary people and events' },
             { pos: 'adj.', zh: '新奇的;新颖的', en: 'new and different from anything known before' }],
    breakdown: [
      { part: 'nov', type: 'root', zh: '新', refId: 'root-nov' },
      { part: 'el', type: 'none' },
    ],
    tags: ['cet4', '高频'],
    examples: [
      { en: 'She is reading a historical novel.', zh: '她正在读一本历史小说。' },
      { en: 'That idea is not novel any more.', zh: '那个想法已经不再新奇了。' },
    ],
    assoc: { story: 'nov(新)+el = 新奇的;(后指)新颖的长篇故事 → 小说。' } },
  { id: 'novelty', word: 'novelty', phonetic: '/ˈnɒvəlti/',
    senses: [{ pos: 'n.', zh: '新奇;新颖性', en: 'the quality of being new and unusual' },
             { pos: 'n.', zh: '新奇的小玩意儿', en: 'a small, cheap object that is new and unusual' }],
    breakdown: [
      { part: 'nov', type: 'root', zh: '新', refId: 'root-nov' },
      { part: 'el', type: 'none' },
      { part: 'ty', type: 'none' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'The novelty of the game soon wore off.', zh: '这个游戏的新鲜劲儿很快就过去了。' },
    ],
    assoc: { story: 'nov(新)+el+ty = 新的状态 → 新奇、新鲜。' } },
  { id: 'innovation', word: 'innovation', phonetic: '/ˌɪnəˈveɪʃn/',
    senses: [{ pos: 'n.', zh: '创新;革新', en: 'a new idea, method or invention' }],
    breakdown: [
      { part: 'in', type: 'prefix', zh: '进入/加强', refId: 'affix-in' },
      { part: 'nov', type: 'root', zh: '新', refId: 'root-nov' },
      { part: 'ation', type: 'suffix', zh: '名词后缀', refId: 'affix-ation' },
    ],
    tags: ['cet6', '高频'],
    examples: [
      { en: 'The company is famous for its innovation.', zh: '这家公司以创新闻名。' },
    ],
    assoc: { story: 'in(加强)+nov(新)+ation = 引入新东西的行为 → 创新。' } },
  { id: 'innovate', word: 'innovate', phonetic: '/ˈɪnəveɪt/',
    senses: [{ pos: 'v.', zh: '创新;革新', en: 'to introduce new ideas or methods' }],
    breakdown: [
      { part: 'in', type: 'prefix', zh: '进入/加强', refId: 'affix-in' },
      { part: 'nov', type: 'root', zh: '新', refId: 'root-nov' },
      { part: 'ate', type: 'suffix', zh: '动词后缀', refId: 'affix-ate' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'We must innovate to stay ahead.', zh: '我们必须创新才能保持领先。' },
    ],
    assoc: {} },
  { id: 'renovate', word: 'renovate', phonetic: '/ˈrenəveɪt/',
    senses: [{ pos: 'v.', zh: '翻新;修复', en: 'to repair and improve a building' }],
    breakdown: [
      { part: 're', type: 'prefix', zh: '再/重新', refId: 'affix-re' },
      { part: 'nov', type: 'root', zh: '新', refId: 'root-nov' },
      { part: 'ate', type: 'suffix', zh: '动词后缀', refId: 'affix-ate' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'They renovated the old house.', zh: '他们把老房子翻新了。' },
    ],
    assoc: { story: 're(重新)+nov(新)+ate = 使它重新变新 → 翻新。' } },
  { id: 'novice', word: 'novice', phonetic: '/ˈnɒvɪs/',
    senses: [{ pos: 'n.', zh: '新手;初学者', en: 'a person who is new at an activity' }],
    breakdown: [
      { part: 'nov', type: 'root', zh: '新', refId: 'root-nov' },
      { part: 'ice', type: 'none' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'The course is designed for novices.', zh: '这门课是为初学者设计的。' },
    ],
    assoc: { story: 'nov(新)+ice = 刚接触某事的新人 → 新手。' } },
];
module.exports = words;
