const words = [
  { id: "linguist", word: "linguist", phonetic: "'lɪŋgwɪst",
    senses: [{ pos: "n.", zh: "语言学家", en: null }],
    breakdown: [
      { part: "lingu", type: "root", zh: "语言", refId: "root-lingu" },
      { part: "ist", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The linguist studied over ten languages.", zh: "这位语言学家研究过十多种语言。" }],
    assoc: { story: "构词:lingu(语言) → 语言学家" } },
  { id: "bilingual", word: "bilingual", phonetic: "ˌbaɪ'lɪŋgwəl",
    senses: [{ pos: "adj.", zh: "双语的", en: null }],
    breakdown: [
      { part: "bi", type: "none" },
      { part: "lingu", type: "root", zh: "语言", refId: "root-lingu" },
      { part: "al", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He is bilingual in English and Chinese.", zh: "他精通英汉双语。" }],
    assoc: { story: "构词:lingu(语言) → 双语的" } },
  { id: "lingual", word: "lingual", phonetic: "'lɪŋgwəl",
    senses: [{ pos: "adj.", zh: "语言的；舌的", en: null }],
    breakdown: [
      { part: "ling", type: "root", zh: "语言", refId: "root-lingu" },
      { part: "ual", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The test measured lingual ability.", zh: "该测试衡量语言能力。" }],
    assoc: { story: "构词:ling(语言) → 语言的" } },
  { id: "linguistics", word: "linguistics", phonetic: "/lɪŋˈɡwɪstɪks/",
    senses: [{ pos: "n.", zh: "语言学", en: "the study of language" }],
    breakdown: [
      { part: "lingu", type: "root", zh: "语言", refId: "root-lingu" },
      { part: "ist", type: "none", zh: "…者" },
      { part: "ics", type: "none", zh: "…学" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Linguistics studies grammar.", zh: "语言学研究语法。" }],
    assoc: { story: "构词:lingu(语言) → 语言学" } },
  { id: "multilingual", word: "multilingual", phonetic: "/ˌmʌltiˈlɪŋɡwəl/",
    senses: [{ pos: "adj.", zh: "多语的", en: "in many languages" }],
    breakdown: [
      { part: "multi", type: "none", zh: "多" },
      { part: "lingu", type: "root", zh: "语言", refId: "root-lingu" },
      { part: "al", type: "suffix", zh: "…的", refId: "affix-al" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The sign is multilingual.", zh: "标牌是多语的。" }],
    assoc: { story: "构词:lingu(语言) + al(…的) → 多语的" } },
  { id: "monolingual", word: "monolingual", phonetic: "/ˌmɒnəˈlɪŋɡwəl/",
    senses: [{ pos: "adj.", zh: "单语的", en: "in one language" }],
    breakdown: [
      { part: "mono", type: "prefix", zh: "一", refId: "affix-mono" },
      { part: "lingu", type: "root", zh: "语言", refId: "root-lingu" },
      { part: "al", type: "suffix", zh: "…的", refId: "affix-al" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He is monolingual.", zh: "他只会一种语言。" }],
    assoc: { story: "构词:mono(一) + lingu(语言) + al(…的) → 单语的" } },
];
module.exports = words;
