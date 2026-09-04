const words = [
  { id: 'inspect', word: 'inspect', phonetic: '/ɪnˈspekt/',
    senses: [{ pos: 'v.', zh: '检查;审视', en: 'to look at carefully' }],
    breakdown: [
      { part: 'in', type: 'prefix', zh: '向内', refId: 'affix-in' },
      { part: 'spect', type: 'root', zh: '看', refId: 'root-spect' },
    ],
    tags: ['cet4', '高频'],
    examples: [{ en: 'The engineer inspected the bridge for cracks.', zh: '工程师检查了桥梁是否有裂缝。' }],
    assoc: {} },
  { id: 'respect', word: 'respect', phonetic: '/rɪˈspekt/',
    senses: [{ pos: 'v.', zh: '尊重', en: 'to admire deeply' }],
    breakdown: [
      { part: 're', type: 'prefix', zh: '再次/回', refId: 'affix-re' },
      { part: 'spect', type: 'root', zh: '看', refId: 'root-spect' },
    ],
    tags: ['cet4', '高频'],
    examples: [{ en: 'Students respect their teacher.', zh: '学生们尊重老师。' }],
    assoc: { synonyms: ['inspect'], story: '一再( re )回头看( spect )对方 → 尊重。' } },
  { id: 'prospect', word: 'prospect', phonetic: '/ˈprɒspekt/',
    senses: [{ pos: 'n.', zh: '前景;可能性', en: 'the possibility that something will happen' }],
    breakdown: [
      { part: 'pro', type: 'prefix', zh: '向前', refId: 'affix-pro' },
      { part: 'spect', type: 'root', zh: '看', refId: 'root-spect' },
    ],
    tags: ['cet4'],
    examples: [{ en: 'There is little prospect of rain today.', zh: '今天下雨的可能性很小。' }],
    assoc: { antonyms: ['inspect'] } },
  { id: 'spectator', word: 'spectator', phonetic: '/spekˈteɪtə/',
    senses: [{ pos: 'n.', zh: '观众;旁观者', en: 'a person watching an event' }],
    breakdown: [
      { part: 'spect', type: 'root', zh: '看', refId: 'root-spect' },
      { part: 'ator', type: 'suffix', zh: '…者', refId: 'affix-ator' },
    ],
    tags: ['cet6'],
    examples: [{ en: 'The spectators cheered the players.', zh: '观众为选手们欢呼。' }],
    assoc: {} },
];
module.exports = words;
