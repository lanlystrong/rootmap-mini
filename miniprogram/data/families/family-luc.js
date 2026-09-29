const words = [
  { id: "lucid", word: "lucid", phonetic: "/ˈluːsɪd/",
    senses: [{ pos: "adj.", zh: "清晰的", en: "clear in thought" }],
    breakdown: [
      { part: "luc", type: "root", zh: "光", refId: "root-luc" },
      { part: "id", type: "none", zh: "…的" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He gave a lucid explanation.", zh: "他作了清晰的讲解。" }],
    assoc: { story: "构词:luc(光) → 清晰的" } },
  { id: "illuminate", word: "illuminate", phonetic: "/ɪˈluːmɪneɪt/",
    senses: [{ pos: "v.", zh: "照亮；阐明", en: "to light up" }],
    breakdown: [
      { part: "il", type: "prefix", zh: "入", refId: "affix-in" },
      { part: "lumin", type: "root", zh: "光", refId: "root-luc" },
      { part: "ate", type: "suffix", zh: "使…", refId: "affix-ate" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Lamps illuminated the street.", zh: "灯光照亮了街道。" }],
    assoc: { story: "构词:il(入) + lumin(光) + ate(使…) → 照亮" } },
  { id: "luxury", word: "luxury", phonetic: "/ˈlʌkʃəri/",
    senses: [{ pos: "n.", zh: "奢侈", en: "great comfort" }],
    breakdown: [
      { part: "lux", type: "root", zh: "光", refId: "root-luc" },
      { part: "ury", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "They live in luxury.", zh: "他们生活奢华。" }],
    assoc: { story: "构词:lux(光) → 奢侈" } },
  { id: "luminous", word: "luminous", phonetic: "/ˈluːmɪnəs/",
    senses: [{ pos: "adj.", zh: "发光的", en: "giving off light" }],
    breakdown: [
      { part: "lumin", type: "root", zh: "光", refId: "root-luc" },
      { part: "ous", type: "suffix", zh: "…的", refId: "affix-ous" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The dial is luminous.", zh: "表盘会发光。" }],
    assoc: { story: "构词:lumin(光) + ous(…的) → 发光的" } },
  { id: "translucent", word: "translucent", phonetic: "/trænzˈluːsnt/",
    senses: [{ pos: "adj.", zh: "半透明的", en: "letting light through" }],
    breakdown: [
      { part: "trans", type: "prefix", zh: "横越", refId: "affix-trans" },
      { part: "luc", type: "root", zh: "光", refId: "root-luc" },
      { part: "ent", type: "suffix", zh: "…的", refId: "affix-ent" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The curtain is translucent.", zh: "窗帘是半透明的。" }],
    assoc: { story: "构词:trans(横越) + luc(光) + ent(…的) → 半透明的" } },
  { id: "elucidate", word: "elucidate", phonetic: "/ɪˈluːsɪdeɪt/",
    senses: [{ pos: "v.", zh: "阐明", en: "to make clear" }],
    breakdown: [
      { part: "e", type: "prefix", zh: "出", refId: "affix-e" },
      { part: "luc", type: "root", zh: "光", refId: "root-luc" },
      { part: "id", type: "none", zh: "…的" },
      { part: "ate", type: "suffix", zh: "使…", refId: "affix-ate" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He elucidated the theory.", zh: "他阐明了该理论。" }],
    assoc: { story: "构词:e(出) + luc(光) + ate(使…) → 阐明" } },
];
module.exports = words;
