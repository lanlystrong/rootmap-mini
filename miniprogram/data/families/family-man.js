const words = [
  { id: 'manual', word: 'manual', phonetic: '/ˈmænjuəl/',
    senses: [{ pos: 'adj.', zh: '手工的;体力的', en: 'done by hand or using physical strength' },
             { pos: 'n.', zh: '手册;说明书', en: 'a book that tells you how to use or do something' }],
    breakdown: [
      { part: 'manu', type: 'root', zh: '手', refId: 'root-man' },
      { part: 'al', type: 'suffix', zh: '…的', refId: 'affix-al' },
    ],
    tags: ['cet4'],
    examples: [
      { en: 'Read the manual before using the machine.', zh: '使用这台机器前请先读说明书。' },
      { en: 'The work is tiring because it is manual.', zh: '这活儿很累,因为是体力活。' },
    ],
    assoc: { story: 'manu(手)+al = 用手做的 → 手工的;手册(供手边随时翻看)。' } },
  { id: 'manage', word: 'manage', phonetic: '/ˈmænɪdʒ/',
    senses: [{ pos: 'v.', zh: '经营;管理', en: 'to run a business or an organization' },
             { pos: 'v.', zh: '设法做到', en: 'to succeed in doing something difficult' }],
    breakdown: [
      { part: 'man', type: 'root', zh: '手', refId: 'root-man' },
      { part: 'age', type: 'none' },
    ],
    tags: ['cet4', '高频'],
    examples: [
      { en: 'She manages a small company.', zh: '她经营着一家小公司。' },
      { en: 'I managed to catch the last bus.', zh: '我设法赶上了末班车。' },
    ],
    assoc: { story: 'man(手)+age = 亲手去掌控 → 管理、设法做到。' } },
  { id: 'management', word: 'management', phonetic: '/ˈmænɪdʒmənt/',
    senses: [{ pos: 'n.', zh: '经营;管理', en: 'the control and running of a business or organization' },
             { pos: 'n.', zh: '管理层', en: 'the people in charge of a company' }],
    breakdown: [
      { part: 'man', type: 'root', zh: '手', refId: 'root-man' },
      { part: 'age', type: 'none' },
      { part: 'ment', type: 'suffix', zh: '名词后缀', refId: 'affix-ment' },
    ],
    tags: ['cet4', '高频'],
    examples: [
      { en: 'The company needs better management.', zh: '这家公司需要更好的管理。' },
    ],
    assoc: { story: 'manage(管理)+ment = 管理的行为或人员 → 经营、管理层。' } },
  { id: 'manufacture', word: 'manufacture', phonetic: '/ˌmænjuˈfæktʃə/',
    senses: [{ pos: 'v.', zh: '制造;(大量)生产', en: 'to make goods in large quantities using machines' },
             { pos: 'n.', zh: '制造;制造业', en: 'the process of making goods in factories' }],
    breakdown: [
      { part: 'manu', type: 'root', zh: '手', refId: 'root-man' },
      { part: 'fact', type: 'none' },
      { part: 'ure', type: 'suffix', zh: '名词后缀', refId: 'affix-ure' },
    ],
    tags: ['cet4'],
    examples: [
      { en: 'This factory manufactures car parts.', zh: '这家工厂制造汽车零件。' },
    ],
    assoc: { story: 'manu(手)+fact(做,源自拉丁语 facere)+ure = 最初「用手做」→ 制造。' } },
  { id: 'manipulate', word: 'manipulate', phonetic: '/məˈnɪpjuleɪt/',
    senses: [{ pos: 'v.', zh: '操纵;控制', en: 'to control someone or something in a clever or unfair way' },
             { pos: 'v.', zh: '(熟练地)操作', en: 'to handle or control something skilfully' }],
    breakdown: [
      { part: 'man', type: 'root', zh: '手', refId: 'root-man' },
      { part: 'ipul', type: 'none' },
      { part: 'ate', type: 'suffix', zh: '动词后缀', refId: 'affix-ate' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'He tried to manipulate the results.', zh: '他试图操纵结果。' },
    ],
    assoc: { story: 'man(手)+ipul+ate = 用手摆布 → 操纵、控制。(源自拉丁语 manipulus「一把」)' } },
];
module.exports = words;
