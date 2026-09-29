const words = [
  { id: "philosophy", word: "philosophy", phonetic: "fə'lɒsəfi",
    senses: [{ pos: "n.", zh: "哲学", en: null }],
    breakdown: [
      { part: "phil", type: "root", zh: "爱", refId: "root-phil" },
      { part: "osophy", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Philosophy is the love of wisdom.", zh: "哲学是对智慧的热爱。" }],
    assoc: { story: "构词:phil(爱) → 哲学" } },
  { id: "philanthropy", word: "philanthropy", phonetic: "fɪ'lænθrəpi",
    senses: [{ pos: "n.", zh: "慈善；博爱", en: null }],
    breakdown: [
      { part: "phil", type: "root", zh: "爱", refId: "root-phil" },
      { part: "anthropy", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "His philanthropy helped build many schools.", zh: "他的慈善之举捐助修建了许多学校。" }],
    assoc: { story: "构词:phil(爱) → 慈善" } },
  { id: "philharmonic", word: "philharmonic", phonetic: "ˌfɪlhɑː'mɒnɪk",
    senses: [{ pos: "adj.", zh: "爱乐的；交响乐团", en: null }],
    breakdown: [
      { part: "phil", type: "root", zh: "爱", refId: "root-phil" },
      { part: "harmonic", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The Vienna Philharmonic is a famous orchestra.", zh: "维也纳爱乐乐团举世闻名。" }],
    assoc: { story: "构词:phil(爱) → 爱乐的" } },
  { id: "philosopher", word: "philosopher", phonetic: "/fəˈlɒsəfə/",
    senses: [{ pos: "n.", zh: "哲学家", en: "a lover of wisdom" }],
    breakdown: [
      { part: "phil", type: "root", zh: "爱", refId: "root-phil" },
      { part: "osoph", type: "none", zh: "智慧" },
      { part: "er", type: "none", zh: "…者" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Socrates was a philosopher.", zh: "苏格拉底是哲学家。" }],
    assoc: { story: "构词:phil(爱) → 哲学家" } },
  { id: "philanthropist", word: "philanthropist", phonetic: "/fɪˈlænθrəpɪst/",
    senses: [{ pos: "n.", zh: "慈善家", en: "a lover of mankind" }],
    breakdown: [
      { part: "phil", type: "root", zh: "爱", refId: "root-phil" },
      { part: "anthrop", type: "none", zh: "人" },
      { part: "ist", type: "none", zh: "…者" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The philanthropist funded schools.", zh: "慈善家资助了学校。" }],
    assoc: { story: "构词:phil(爱) → 慈善家" } },
  { id: "philology", word: "philology", phonetic: "/fɪˈlɒlədʒi/",
    senses: [{ pos: "n.", zh: "语文学", en: "the study of language" }],
    breakdown: [
      { part: "phil", type: "root", zh: "爱", refId: "root-phil" },
      { part: "ology", type: "none", zh: "…学" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He studied classical philology.", zh: "他研究古典语文学。" }],
    assoc: { story: "构词:phil(爱) → 语文学" } },
];
module.exports = words;
