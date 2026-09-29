const words = [
  { id: "novel", word: "novel", phonetic: "/ˈnɒvəl/",
    senses: [{ pos: "n.", zh: "(长篇)小说", en: "a long written story about imaginary people and events" }],
    breakdown: [
      { part: "nov", type: "root", zh: "新", refId: "root-nov" },
      { part: "el", type: "none" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "She is reading a historical novel.", zh: "她正在读一本历史小说。" }],
    assoc: { story: "nov(新)+el = 新奇的;(后指)新颖的长篇故事 → 小说。" } },
  { id: "innovation", word: "innovation", phonetic: "/ˌɪnəˈveɪʃn/",
    senses: [{ pos: "n.", zh: "创新;革新", en: "a new idea, method or invention" }],
    breakdown: [
      { part: "in", type: "prefix", zh: "进入/加强", refId: "affix-in" },
      { part: "nov", type: "root", zh: "新", refId: "root-nov" },
      { part: "ation", type: "suffix", zh: "名词后缀", refId: "affix-ation" }
    ],
    tags: ["cet6", "高频"],
    examples: [{ en: "The company is famous for its innovation.", zh: "这家公司以创新闻名。" }],
    assoc: { story: "in(加强)+nov(新)+ation = 引入新东西的行为 → 创新。" } },
  { id: "renovate", word: "renovate", phonetic: "/ˈrenəveɪt/",
    senses: [{ pos: "v.", zh: "翻新;修复", en: "to repair and improve a building" }],
    breakdown: [
      { part: "re", type: "prefix", zh: "再/重新", refId: "affix-re" },
      { part: "nov", type: "root", zh: "新", refId: "root-nov" },
      { part: "ate", type: "suffix", zh: "动词后缀", refId: "affix-ate" }
    ],
    tags: ["cet6"],
    examples: [{ en: "They renovated the old house.", zh: "他们把老房子翻新了。" }],
    assoc: { story: "re(重新)+nov(新)+ate = 使它重新变新 → 翻新。" } },
  { id: "innovate", word: "innovate", phonetic: "/ˈɪnəveɪt/",
    senses: [{ pos: "v.", zh: "创新", en: "to introduce something new" }],
    breakdown: [
      { part: "in", type: "prefix", zh: "入", refId: "affix-in" },
      { part: "nov", type: "root", zh: "新", refId: "root-nov" },
      { part: "ate", type: "suffix", zh: "使…", refId: "affix-ate" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The firm aims to innovate.", zh: "该公司致力于创新。" }],
    assoc: { story: "构词:in(入) + nov(新) + ate(使…) → 创新" } },
  { id: "novelty", word: "novelty", phonetic: "/ˈnɒvlti/",
    senses: [{ pos: "n.", zh: "新奇", en: "the quality of being new" }],
    breakdown: [
      { part: "nov", type: "root", zh: "新", refId: "root-nov" },
      { part: "el", type: "none", zh: "小" },
      { part: "ty", type: "none", zh: "…性" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The toy lost its novelty.", zh: "玩具不再新鲜。" }],
    assoc: { story: "构词:nov(新) → 新奇" } },
  { id: "novice", word: "novice", phonetic: "/ˈnɒvɪs/",
    senses: [{ pos: "n.", zh: "新手", en: "a beginner" }],
    breakdown: [
      { part: "nov", type: "root", zh: "新", refId: "root-nov" },
      { part: "ice", type: "none", zh: "…人" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He is a novice at skiing.", zh: "他是滑雪新手。" }],
    assoc: { story: "构词:nov(新) → 新手" } },
];
module.exports = words;
