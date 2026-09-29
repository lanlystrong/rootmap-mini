const words = [
  { id: "phone", word: "phone", phonetic: "/fəʊn/",
    senses: [{ pos: "n.", zh: "电话;手机", en: "a telephone or mobile phone" }],
    breakdown: [
      { part: "phon", type: "root", zh: "声音", refId: "root-phon" },
      { part: "e", type: "none" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "My phone is out of battery.", zh: "我的手机没电了。" }],
    assoc: { story: "phon(声音)+e = 传递声音的工具 → 电话。" } },
  { id: "phonetics", word: "phonetics", phonetic: "/fəˈnetɪks/",
    senses: [{ pos: "n.", zh: "语音学", en: "the study of the sounds of human speech" }],
    breakdown: [
      { part: "phon", type: "root", zh: "声音", refId: "root-phon" },
      { part: "etic", type: "suffix", zh: "…的", refId: "affix-etic" },
      { part: "s", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "She is studying phonetics at university.", zh: "她在大学攻读语音学。" }],
    assoc: { story: "phon(声音)+etics = 研究语音的学问 → 语音学。" } },
  { id: "telephone", word: "telephone", phonetic: "/ˈtelɪfəʊn/",
    senses: [{ pos: "n.", zh: "电话", en: "a device for voice" }],
    breakdown: [
      { part: "tele", type: "prefix", zh: "远", refId: "affix-tele" },
      { part: "phon", type: "root", zh: "声音", refId: "root-phon" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He answered the telephone.", zh: "他接起了电话。" }],
    assoc: { story: "构词:tele(远) + phon(声音) → 电话" } },
  { id: "microphone", word: "microphone", phonetic: "/ˈmaɪkrəfəʊn/",
    senses: [{ pos: "n.", zh: "麦克风", en: "a device for sound" }],
    breakdown: [
      { part: "micro", type: "prefix", zh: "小", refId: "affix-micro" },
      { part: "phon", type: "root", zh: "声音", refId: "root-phon" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Speak into the microphone.", zh: "对着麦克风讲话。" }],
    assoc: { story: "构词:micro(小) + phon(声音) → 麦克风" } },
  { id: "symphony", word: "symphony", phonetic: "/ˈsɪmfəni/",
    senses: [{ pos: "n.", zh: "交响乐", en: "a long piece for orchestra" }],
    breakdown: [
      { part: "sym", type: "prefix", zh: "共同", refId: "affix-sym" },
      { part: "phon", type: "root", zh: "声音", refId: "root-phon" },
      { part: "y", type: "suffix", zh: "…学/术", refId: "affix-y" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Beethoven wrote nine symphonies.", zh: "贝多芬写了九部交响曲。" }],
    assoc: { story: "构词:sym(共同) + phon(声音) + y(…学/术) → 交响乐" } },
  { id: "phonetic", word: "phonetic", phonetic: "/fəˈnetɪk/",
    senses: [{ pos: "adj.", zh: "语音的", en: "of speech sounds" }],
    breakdown: [
      { part: "phon", type: "root", zh: "声音", refId: "root-phon" },
      { part: "etic", type: "suffix", zh: "…的", refId: "affix-etic" }
    ],
    tags: ["cet6"],
    examples: [{ en: "English spelling is not phonetic.", zh: "英语拼写在语音上不规整。" }],
    assoc: { story: "构词:phon(声音) + etic(…的) → 语音的" } },
  { id: "phonology", word: "phonology", phonetic: "/fəˈnɒlədʒi/",
    senses: [{ pos: "n.", zh: "音系学", en: "the study of sound systems" }],
    breakdown: [
      { part: "phon", type: "root", zh: "声音", refId: "root-phon" },
      { part: "ology", type: "none", zh: "…学" }
    ],
    tags: ["cet6"],
    examples: [{ en: "She studies phonology.", zh: "她研究音系学。" }],
    assoc: { story: "构词:phon(声音) → 音系学" } },
];
module.exports = words;
