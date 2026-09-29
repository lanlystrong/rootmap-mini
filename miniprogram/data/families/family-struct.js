const words = [
  { id: "construct", word: "construct", phonetic: "/kənˈstrʌkt/",
    senses: [{ pos: "v.", zh: "建造;构筑", en: "to build or make something large" }],
    breakdown: [
      { part: "con", type: "prefix", zh: "共同", refId: "affix-con" },
      { part: "struct", type: "root", zh: "建造", refId: "root-struct" }
    ],
    tags: ["cet4"],
    examples: [{ en: "The bridge was constructed in 1990.", zh: "这座桥建于 1990 年。" }],
    assoc: { story: "con(共同)+struct(堆建)= 把材料堆到一起 → 建造。" } },
  { id: "structure", word: "structure", phonetic: "/ˈstrʌktʃə/",
    senses: [{ pos: "n.", zh: "结构;构造", en: "the way in which the parts of something are arranged" }],
    breakdown: [
      { part: "struct", type: "root", zh: "建造", refId: "root-struct" },
      { part: "ure", type: "suffix", zh: "名词后缀", refId: "affix-ure" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "The structure of the building is very strong.", zh: "这座建筑的结构非常坚固。" }],
    assoc: { story: undefined } },
  { id: "instruction", word: "instruction", phonetic: "/ɪnˈstrʌkʃn/",
    senses: [{ pos: "n.", zh: "指示;说明", en: "clear directions on how to do something" }],
    breakdown: [
      { part: "in", type: "prefix", zh: "使/向内", refId: "affix-in" },
      { part: "struct", type: "root", zh: "建造", refId: "root-struct" },
      { part: "ion", type: "suffix", zh: "名词后缀", refId: "affix-ion" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "Follow the instructions on the box.", zh: "按照盒子上的说明操作。" }],
    assoc: { story: undefined } },
  { id: "destruction", word: "destruction", phonetic: "/dɪˈstrʌkʃn/",
    senses: [{ pos: "n.", zh: "破坏", en: "the act of destroying" }],
    breakdown: [
      { part: "de", type: "prefix", zh: "离开", refId: "affix-de" },
      { part: "struct", type: "root", zh: "建造", refId: "root-struct" },
      { part: "ion", type: "suffix", zh: "…的状态", refId: "affix-ion" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The war caused massive destruction.", zh: "战争造成了巨大破坏。" }],
    assoc: { story: "构词:de(离开) + struct(建造) + ion(…的状态) → 破坏" } },
  { id: "instruct", word: "instruct", phonetic: "/ɪnˈstrʌkt/",
    senses: [{ pos: "v.", zh: "指导；教导", en: "to teach or direct" }],
    breakdown: [
      { part: "in", type: "prefix", zh: "入", refId: "affix-in" },
      { part: "struct", type: "root", zh: "建造", refId: "root-struct" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The coach instructed the team.", zh: "教练指导了球队。" }],
    assoc: { story: "构词:in(入) + struct(建造) → 指导" } },
  { id: "instructor", word: "instructor", phonetic: "/ɪnˈstrʌktə/",
    senses: [{ pos: "n.", zh: "教员；教练", en: "a person who teaches" }],
    breakdown: [
      { part: "in", type: "prefix", zh: "入", refId: "affix-in" },
      { part: "struct", type: "root", zh: "建造", refId: "root-struct" },
      { part: "or", type: "suffix", zh: "…者", refId: "affix-or" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The instructor explained the rules.", zh: "教员讲解了规则。" }],
    assoc: { story: "构词:in(入) + struct(建造) + or(…者) → 教员" } },
  { id: "reconstruct", word: "reconstruct", phonetic: "/ˌriːkənˈstrʌkt/",
    senses: [{ pos: "v.", zh: "重建", en: "to build again" }],
    breakdown: [
      { part: "re", type: "prefix", zh: "再", refId: "affix-re" },
      { part: "con", type: "prefix", zh: "共同", refId: "affix-con" },
      { part: "struct", type: "root", zh: "建造", refId: "root-struct" }
    ],
    tags: ["cet6"],
    examples: [{ en: "They reconstructed the old bridge.", zh: "他们重建了那座旧桥。" }],
    assoc: { story: "构词:re(再) + con(共同) + struct(建造) → 重建" } },
  { id: "infrastructure", word: "infrastructure", phonetic: "/ˈɪnfrəstrʌktʃə/",
    senses: [{ pos: "n.", zh: "基础设施", en: "basic public systems" }],
    breakdown: [
      { part: "infra", type: "prefix", zh: "在下", refId: "affix-infra" },
      { part: "struct", type: "root", zh: "建造", refId: "root-struct" },
      { part: "ure", type: "suffix", zh: "…的结果", refId: "affix-ure" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The city invested in infrastructure.", zh: "城市投资了基础设施。" }],
    assoc: { story: "构词:infra(在下) + struct(建造) + ure(…的结果) → 基础设施" } },
];
module.exports = words;
