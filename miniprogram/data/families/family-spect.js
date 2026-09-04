const words = [
  { id: 'inspect', word: 'inspect', phonetic: '/ɪnˈspekt/',
    senses: [{ pos: 'v.', zh: '检查;审视', en: 'to look at something carefully to find problems' }],
    breakdown: [
      { part: 'in', type: 'prefix', zh: '向内/凑近', refId: 'affix-in' },
      { part: 'spect', type: 'root', zh: '看', refId: 'root-spect' },
    ],
    tags: ['cet4', '高频'],
    examples: [
      { en: 'The engineer inspected the bridge for cracks.', zh: '工程师检查了桥梁是否有裂缝。' },
      { en: 'A mechanic is inspecting the car engine.', zh: '机械师正在检查汽车发动机。' },
    ],
    assoc: {} },
  { id: 'respect', word: 'respect', phonetic: '/rɪˈspekt/',
    senses: [{ pos: 'v.', zh: '尊重;尊敬', en: 'to admire someone and treat them well' },
             { pos: 'n.', zh: '尊重;敬意', en: 'a feeling of admiration for someone' }],
    breakdown: [
      { part: 're', type: 'prefix', zh: '再次/回', refId: 'affix-re' },
      { part: 'spect', type: 'root', zh: '看', refId: 'root-spect' },
    ],
    tags: ['cet4', '高频'],
    examples: [
      { en: 'Students should respect their teachers.', zh: '学生应当尊重老师。' },
      { en: 'We should respect other people’s opinions.', zh: '我们应该尊重他人的意见。' },
    ],
    assoc: { story: 're(一再)+spect(看)= 一再回头(看重)对方 → 尊重、敬重。' } },
  { id: 'prospect', word: 'prospect', phonetic: '/ˈprɒspekt/',
    senses: [{ pos: 'n.', zh: '前景;可能性', en: 'the possibility that something good will happen' },
             { pos: 'n.', zh: '机会;前途', en: 'chances of future success' }],
    breakdown: [
      { part: 'pro', type: 'prefix', zh: '向前', refId: 'affix-pro' },
      { part: 'spect', type: 'root', zh: '看', refId: 'root-spect' },
    ],
    tags: ['cet4'],
    examples: [
      { en: 'There is little prospect of rain today.', zh: '今天下雨的可能性很小。' },
      { en: 'The job offers good prospects for promotion.', zh: '这份工作有很好的晋升前景。' },
    ],
    assoc: {} },
  { id: 'spectator', word: 'spectator', phonetic: '/spekˈteɪtə/',
    senses: [{ pos: 'n.', zh: '观众;旁观者', en: 'a person who is watching an event or game' }],
    breakdown: [
      { part: 'spect', type: 'root', zh: '看', refId: 'root-spect' },
      { part: 'ator', type: 'suffix', zh: '…的人', refId: 'affix-ator' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'The spectators cheered the players.', zh: '观众为选手们欢呼。' },
      { en: 'Thousands of spectators watched the final match.', zh: '数千名观众观看了决赛。' },
    ],
    assoc: {} },
  { id: 'perspective', word: 'perspective', phonetic: '/pəˈspektɪv/',
    senses: [{ pos: 'n.', zh: '观点;视角', en: 'a particular way of thinking about something' },
             { pos: 'n.', zh: '透视(画)法;景观', en: 'the art of drawing objects so they look real' }],
    breakdown: [
      { part: 'per', type: 'prefix', zh: '透过/贯穿', refId: 'affix-per' },
      { part: 'spect', type: 'root', zh: '看', refId: 'root-spect' },
      { part: 'ive', type: 'suffix', zh: '…的', refId: 'affix-ive' },
    ],
    tags: ['cet4'],
    examples: [
      { en: 'From my perspective, the plan is too risky.', zh: '在我看来,这个计划风险太大。' },
      { en: 'Try to look at the problem from a different perspective.', zh: '试着从不同角度看待这个问题。' },
    ],
    assoc: {} },
  { id: 'retrospect', word: 'retrospect', phonetic: '/ˈretrəspekt/',
    senses: [{ pos: 'n.', zh: '回顾;回想', en: 'thinking about past events (in retrospect)' }],
    breakdown: [
      { part: 'retro', type: 'prefix', zh: '向后', refId: 'affix-retro' },
      { part: 'spect', type: 'root', zh: '看', refId: 'root-spect' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'In retrospect, I should have taken the job.', zh: '回首往事,我本应接受那份工作。' },
      { en: 'The decision looks wise in retrospect.', zh: '事后看来,这个决定是明智的。' },
    ],
    assoc: {} },
];
module.exports = words;
