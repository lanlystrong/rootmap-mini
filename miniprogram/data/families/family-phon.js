const words = [
  { id: 'phone', word: 'phone', phonetic: '/fəʊn/',
    senses: [{ pos: 'n.', zh: '电话;手机', en: 'a telephone or mobile phone' },
             { pos: 'v.', zh: '打电话', en: 'to call someone by telephone' }],
    breakdown: [
      { part: 'phon', type: 'root', zh: '声音', refId: 'root-phon' },
      { part: 'e', type: 'none' },
    ],
    tags: ['cet4', '高频'],
    examples: [
      { en: 'My phone is out of battery.', zh: '我的手机没电了。' },
      { en: 'I will phone you later.', zh: '我晚点给你打电话。' },
    ],
    assoc: { story: 'phon(声音)+e = 传递声音的工具 → 电话。' } },
  { id: 'telephone', word: 'telephone', phonetic: '/ˈtelɪfəʊn/',
    senses: [{ pos: 'n.', zh: '电话;电话机', en: 'a system or device for speaking to someone far away' },
             { pos: 'v.', zh: '打电话', en: 'to speak to someone by telephone' }],
    breakdown: [
      { part: 'tele', type: 'prefix', zh: '远', refId: 'affix-tele' },
      { part: 'phon', type: 'root', zh: '声音', refId: 'root-phon' },
      { part: 'e', type: 'none' },
    ],
    tags: ['cet4', '高频'],
    examples: [
      { en: 'He answered the telephone on the first ring.', zh: '电话铃一响他就接了起来。' },
    ],
    assoc: { story: 'tele(远)+phon(声音)+e = 把声音传到远处 → 电话。' } },
  { id: 'microphone', word: 'microphone', phonetic: '/ˈmaɪkrəfəʊn/',
    senses: [{ pos: 'n.', zh: '麦克风;话筒', en: 'a device that turns sound into an electrical signal' }],
    breakdown: [
      { part: 'micro', type: 'prefix', zh: '微小', refId: 'affix-micro' },
      { part: 'phon', type: 'root', zh: '声音', refId: 'root-phon' },
      { part: 'e', type: 'none' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'Speak closer to the microphone.', zh: '说话离麦克风近一点。' },
    ],
    assoc: {} },
  { id: 'symphony', word: 'symphony', phonetic: '/ˈsɪmfəni/',
    senses: [{ pos: 'n.', zh: '交响乐;交响曲', en: 'a long piece of music for an orchestra' }],
    breakdown: [
      { part: 'sym', type: 'prefix', zh: '共同/一起', refId: 'affix-sym' },
      { part: 'phon', type: 'root', zh: '声音', refId: 'root-phon' },
      { part: 'y', type: 'suffix', zh: '名词后缀', refId: 'affix-y' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'The orchestra played Beethoven’s Ninth Symphony.', zh: '乐团演奏了贝多芬第九交响曲。' },
    ],
    assoc: { story: 'sym(共同)+phon(声音)+y = 众多乐器一起发声 → 交响乐。' } },
  { id: 'phonetic', word: 'phonetic', phonetic: '/fəˈnetɪk/',
    senses: [{ pos: 'adj.', zh: '语音的;音标的', en: 'relating to the sounds of speech' }],
    breakdown: [
      { part: 'phon', type: 'root', zh: '声音', refId: 'root-phon' },
      { part: 'etic', type: 'suffix', zh: '…的', refId: 'affix-etic' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'The dictionary gives the phonetic symbols of each word.', zh: '这本词典标注了每个词的音标。' },
    ],
    assoc: {} },
  { id: 'phonetics', word: 'phonetics', phonetic: '/fəˈnetɪks/',
    senses: [{ pos: 'n.', zh: '语音学', en: 'the study of the sounds of human speech' }],
    breakdown: [
      { part: 'phon', type: 'root', zh: '声音', refId: 'root-phon' },
      { part: 'etic', type: 'suffix', zh: '…的', refId: 'affix-etic' },
      { part: 's', type: 'none' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'She is studying phonetics at university.', zh: '她在大学攻读语音学。' },
    ],
    assoc: { story: 'phon(声音)+etics = 研究语音的学问 → 语音学。' } },
];
module.exports = words;
