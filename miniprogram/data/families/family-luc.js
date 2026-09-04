const words = [
  { id: 'lucid', word: 'lucid', phonetic: '/ˈluːsɪd/',
    senses: [{ pos: 'adj.', zh: '清晰的;易懂的', en: 'clear and easy to understand' },
             { pos: 'adj.', zh: '头脑清醒的', en: 'able to think clearly' }],
    breakdown: [
      { part: 'luc', type: 'root', zh: '光', refId: 'root-luc' },
      { part: 'id', type: 'none' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'She gave a lucid explanation of the theory.', zh: '她把那个理论讲得很清晰。' },
    ],
    assoc: { story: 'luc(光)+id = 像光一样通透 → 清晰的、清醒的。' } },
  { id: 'translucent', word: 'translucent', phonetic: '/trænzˈluːsnt/',
    senses: [{ pos: 'adj.', zh: '半透明的', en: 'allowing light to pass through, but not clear enough to see through' }],
    breakdown: [
      { part: 'trans', type: 'prefix', zh: '穿过', refId: 'affix-trans' },
      { part: 'luc', type: 'root', zh: '光', refId: 'root-luc' },
      { part: 'ent', type: 'suffix', zh: '…的', refId: 'affix-ent' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'The bathroom window is made of translucent glass.', zh: '浴室的窗户是半透明玻璃做的。' },
    ],
    assoc: { story: 'trans(穿过)+luc(光)+ent = 光能穿过的 → 半透明的。' } },
  { id: 'illuminate', word: 'illuminate', phonetic: '/ɪˈluːmɪneɪt/',
    senses: [{ pos: 'v.', zh: '照亮;照明', en: 'to make something bright with light' },
             { pos: 'v.', zh: '阐明;解释', en: 'to make something clearer and easier to understand' }],
    breakdown: [
      { part: 'il', type: 'prefix', zh: '使/加强', refId: 'affix-il' },
      { part: 'lumin', type: 'root', zh: '光', refId: 'root-luc' },
      { part: 'ate', type: 'suffix', zh: '动词后缀', refId: 'affix-ate' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'The streets are illuminated by street lamps.', zh: '街道被路灯照亮。' },
    ],
    assoc: { story: 'il(加强)+lumin(光)+ate = 使充满光 → 照亮;引申为阐明。' } },
  { id: 'luminous', word: 'luminous', phonetic: '/ˈluːmɪnəs/',
    senses: [{ pos: 'adj.', zh: '发光的;夜光的', en: 'giving out light, especially in the dark' }],
    breakdown: [
      { part: 'lumin', type: 'root', zh: '光', refId: 'root-luc' },
      { part: 'ous', type: 'suffix', zh: '充满…的', refId: 'affix-ous' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'The watch has luminous hands.', zh: '这块手表的指针是夜光的。' },
    ],
    assoc: { story: 'lumin(光)+ous(…的) = 发光的。' } },
];
module.exports = words;
