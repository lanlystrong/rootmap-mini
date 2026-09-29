const words = [
  { id: "lithium", word: "lithium", phonetic: "'lɪθiəm",
    senses: [{ pos: "n.", zh: "锂", en: null }],
    breakdown: [
      { part: "lith", type: "root", zh: "石", refId: "root-lith" },
      { part: "ium", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Lithium is used in rechargeable batteries.", zh: "锂用于可充电电池。" }],
    assoc: { story: "构词:lith(石) → 锂" } },
  { id: "lithograph", word: "lithograph", phonetic: "'lɪθəgrɑːf",
    senses: [{ pos: "n.", zh: "平版印刷品；石印画", en: null }],
    breakdown: [
      { part: "lith", type: "root", zh: "石", refId: "root-lith" },
      { part: "ograph", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The museum displayed an original lithograph.", zh: "博物馆展出了一幅石印原作。" }],
    assoc: { story: "构词:lith(石) → 平版印刷品" } },
  { id: "monolith", word: "monolith", phonetic: "'mɒnəlɪθ",
    senses: [{ pos: "n.", zh: "独石；巨石柱", en: null }],
    breakdown: [
      { part: "mono", type: "none" },
      { part: "lith", type: "root", zh: "石", refId: "root-lith" }
    ],
    tags: ["cet6"],
    examples: [{ en: "A monolith stood in the desert.", zh: "一块巨石矗立在沙漠中。" }],
    assoc: { story: "构词:lith(石) → 独石" } },
  { id: "lithosphere", word: "lithosphere", phonetic: "/ˈlɪθəsfɪə/",
    senses: [{ pos: "n.", zh: "岩石圈", en: "the rocky outer shell" }],
    breakdown: [
      { part: "lith", type: "root", zh: "石", refId: "root-lith" },
      { part: "o", type: "none" },
      { part: "sphere", type: "none", zh: "球" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Tectonics moves the lithosphere.", zh: "板块运动推动岩石圈。" }],
    assoc: { story: "构词:lith(石) → 岩石圈" } },
  { id: "paleolithic", word: "paleolithic", phonetic: "/ˌpæliəˈlɪθɪk/",
    senses: [{ pos: "adj.", zh: "旧石器时代的", en: "of the old stone age" }],
    breakdown: [
      { part: "paleo", type: "none", zh: "古" },
      { part: "lith", type: "root", zh: "石", refId: "root-lith" },
      { part: "ic", type: "suffix", zh: "…的", refId: "affix-ic" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Paleolithic tools were crude.", zh: "旧石器时代的工具很粗糙。" }],
    assoc: { story: "构词:lith(石) + ic(…的) → 旧石器时代的" } },
  { id: "neolithic", word: "neolithic", phonetic: "/ˌniːəˈlɪθɪk/",
    senses: [{ pos: "adj.", zh: "新石器时代的", en: "of the new stone age" }],
    breakdown: [
      { part: "neo", type: "none", zh: "新" },
      { part: "lith", type: "root", zh: "石", refId: "root-lith" },
      { part: "ic", type: "suffix", zh: "…的", refId: "affix-ic" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Neolithic farmers grew crops.", zh: "新石器时代的农民耕种作物。" }],
    assoc: { story: "构词:lith(石) + ic(…的) → 新石器时代的" } },
  { id: "megalith", word: "megalith", phonetic: "/ˈmeɡəlɪθ/",
    senses: [{ pos: "n.", zh: "巨石", en: "a huge stone" }],
    breakdown: [
      { part: "mega", type: "none", zh: "大" },
      { part: "lith", type: "root", zh: "石", refId: "root-lith" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The megalith stood for ages.", zh: "巨石矗立了很久。" }],
    assoc: { story: "构词:lith(石) → 巨石" } },
];
module.exports = words;
