const words = [
  { id: "theory", word: "theory", phonetic: "'θɪəri",
    senses: [{ pos: "n.", zh: "理论；学说", en: null }],
    breakdown: [
      { part: "the", type: "root", zh: "神/理论", refId: "root-theo" },
      { part: "ory", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He proposed a new theory of gravity.", zh: "他提出了一个新的引力理论。" }],
    assoc: { story: "构词:the(神/理论) → 理论" } },
  { id: "theorem", word: "theorem", phonetic: "'θɪərəm",
    senses: [{ pos: "n.", zh: "定理；原理", en: null }],
    breakdown: [
      { part: "the", type: "root", zh: "神/理论", refId: "root-theo" },
      { part: "orem", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Pythagoras proved a famous theorem about right triangles.", zh: "毕达哥拉斯证明了一个关于直角三角形的著名定理。" }],
    assoc: { story: "构词:the(神/理论) → 定理" } },
  { id: "theology", word: "theology", phonetic: "θɪ'ɒlədʒi",
    senses: [{ pos: "n.", zh: "神学", en: null }],
    breakdown: [
      { part: "the", type: "root", zh: "神/理论", refId: "root-theo" },
      { part: "ology", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "She studied theology at the university.", zh: "她在大学里学习神学。" }],
    assoc: { story: "构词:the(神/理论) → 神学" } },
  { id: "atheist", word: "atheist", phonetic: "'eɪθiɪst",
    senses: [{ pos: "n.", zh: "无神论者", en: null }],
    breakdown: [
      { part: "a", type: "none" },
      { part: "the", type: "root", zh: "神/理论", refId: "root-theo" },
      { part: "ist", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "An atheist does not believe in any god.", zh: "无神论者不信奉任何神灵。" }],
    assoc: { story: "构词:the(神/理论) → 无神论者" } },
  { id: "antithesis", word: "antithesis", phonetic: "æn'tɪθɪsɪs",
    senses: [{ pos: "n.", zh: "对立面；对照", en: null }],
    breakdown: [
      { part: "anti", type: "none" },
      { part: "the", type: "root", zh: "神/理论", refId: "root-theo" },
      { part: "sis", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "His opinion is the antithesis of mine.", zh: "他的观点与我的截然相反。" }],
    assoc: { story: "构词:the(神/理论) → 对立面" } },
  { id: "thesis", word: "thesis", phonetic: "'θiːsɪs",
    senses: [{ pos: "n.", zh: "论文；论点", en: null }],
    breakdown: [
      { part: "the", type: "root", zh: "神/理论", refId: "root-theo" },
      { part: "sis", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He is writing his doctoral thesis.", zh: "他正在撰写博士论文。" }],
    assoc: { story: "构词:the(神/理论) → 论文" } },
  { id: "theme", word: "theme", phonetic: "θiːm",
    senses: [{ pos: "n.", zh: "主题；题目", en: null }],
    breakdown: [
      { part: "the", type: "root", zh: "神/理论", refId: "root-theo" },
      { part: "me", type: "none" }
    ],
    tags: ["cet4"],
    examples: [{ en: "The theme of the novel is love.", zh: "这部小说的主题是爱。" }],
    assoc: { story: "构词:the(神/理论) → 主题" } },
  { id: "theoretical", word: "theoretical", phonetic: "/ˌθɪəˈretɪkl/",
    senses: [{ pos: "adj.", zh: "理论的", en: "based on theory" }],
    breakdown: [
      { part: "theo", type: "root", zh: "神/理论", refId: "root-theo" },
      { part: "retical", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "This is a theoretical model.", zh: "这是个理论模型。" }],
    assoc: { story: "构词:theo(神/理论) → 理论的" } },
  { id: "monotheism", word: "monotheism", phonetic: "/ˈmɒnəθiːɪzəm/",
    senses: [{ pos: "n.", zh: "一神论", en: "belief in one god" }],
    breakdown: [
      { part: "mono", type: "prefix", zh: "一", refId: "affix-mono" },
      { part: "the", type: "root", zh: "神/理论", refId: "root-theo" },
      { part: "ism", type: "none", zh: "…主义" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Judaism is monotheism.", zh: "犹太教是一神论。" }],
    assoc: { story: "构词:mono(一) + the(神/理论) → 一神论" } },
  { id: "theocracy", word: "theocracy", phonetic: "/θɪˈɒkrəsi/",
    senses: [{ pos: "n.", zh: "神权政治", en: "rule by priests" }],
    breakdown: [
      { part: "theo", type: "root", zh: "神/理论", refId: "root-theo" },
      { part: "cracy", type: "none", zh: "统治" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The state was a theocracy.", zh: "该国曾是神权国。" }],
    assoc: { story: "构词:theo(神/理论) → 神权政治" } },
];
module.exports = words;
