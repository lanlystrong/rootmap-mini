const words = [
  { id: "cosmic", word: "cosmic", phonetic: "'kɒzmɪk",
    senses: [{ pos: "adj.", zh: "宇宙的；极广大的", en: null }],
    breakdown: [
      { part: "cosm", type: "root", zh: "宇宙/秩序", refId: "root-cosm" },
      { part: "ic", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The discovery had cosmic significance.", zh: "这一发现具有宇宙级的意义。" }],
    assoc: { story: "构词:cosm(宇宙/秩序) → 宇宙的" } },
  { id: "cosmopolitan", word: "cosmopolitan", phonetic: "ˌkɒzmə'pɒlɪtən",
    senses: [{ pos: "adj.", zh: "世界性的；四海为家的", en: null }],
    breakdown: [
      { part: "cosm", type: "root", zh: "宇宙/秩序", refId: "root-cosm" },
      { part: "opolitan", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "New York is a cosmopolitan city.", zh: "纽约是一座世界性的城市。" }],
    assoc: { story: "构词:cosm(宇宙/秩序) → 世界性的" } },
  { id: "cosmos", word: "cosmos", phonetic: "'kɒzmɒs",
    senses: [{ pos: "n.", zh: "宇宙", en: null }],
    breakdown: [
      { part: "cosm", type: "root", zh: "宇宙/秩序", refId: "root-cosm" },
      { part: "os", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Scientists explore the mysteries of the cosmos.", zh: "科学家探索宇宙的奥秘。" }],
    assoc: { story: "构词:cosm(宇宙/秩序) → 宇宙" } },
  { id: "cosmology", word: "cosmology", phonetic: "/kɒzˈmɒlədʒi/",
    senses: [{ pos: "n.", zh: "宇宙学", en: "the study of the universe" }],
    breakdown: [
      { part: "cosm", type: "root", zh: "宇宙/秩序", refId: "root-cosm" },
      { part: "ology", type: "none", zh: "…学" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Cosmology explores the cosmos.", zh: "宇宙学研究宇宙。" }],
    assoc: { story: "构词:cosm(宇宙/秩序) → 宇宙学" } },
  { id: "microcosm", word: "microcosm", phonetic: "/ˈmaɪkrəʊkɒzəm/",
    senses: [{ pos: "n.", zh: "微观世界", en: "a small representative world" }],
    breakdown: [
      { part: "micro", type: "prefix", zh: "小", refId: "affix-micro" },
      { part: "cosm", type: "root", zh: "宇宙/秩序", refId: "root-cosm" }
    ],
    tags: ["cet6"],
    examples: [{ en: "A cell is a microcosm of life.", zh: "细胞是生命的微观缩影。" }],
    assoc: { story: "构词:micro(小) + cosm(宇宙/秩序) → 微观世界" } },
  { id: "cosmonaut", word: "cosmonaut", phonetic: "/ˈkɒzmənɔːt/",
    senses: [{ pos: "n.", zh: "宇航员", en: "a space traveler" }],
    breakdown: [
      { part: "cosm", type: "root", zh: "宇宙/秩序", refId: "root-cosm" },
      { part: "onaut", type: "none", zh: "航行" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The cosmonaut orbited Earth.", zh: "宇航员绕地球飞行。" }],
    assoc: { story: "构词:cosm(宇宙/秩序) → 宇航员" } },
];
module.exports = words;
