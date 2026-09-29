const words = [
  { id: "toxic", word: "toxic", phonetic: "'tɒksɪk",
    senses: [{ pos: "adj.", zh: "有毒的；中毒的", en: null }],
    breakdown: [
      { part: "tox", type: "root", zh: "毒", refId: "root-tox" },
      { part: "ic", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The chemical is highly toxic.", zh: "这种化学品剧毒。" }],
    assoc: { story: "构词:tox(毒) → 有毒的" } },
  { id: "toxin", word: "toxin", phonetic: "'tɒksɪn",
    senses: [{ pos: "n.", zh: "毒素；毒质", en: null }],
    breakdown: [
      { part: "tox", type: "root", zh: "毒", refId: "root-tox" },
      { part: "in", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The toxin damages the liver.", zh: "这种毒素损害肝脏。" }],
    assoc: { story: "构词:tox(毒) → 毒素" } },
  { id: "detoxification", word: "detoxification", phonetic: "diːˌtɒksɪfɪ'keɪʃən",
    senses: [{ pos: "n.", zh: "解毒；排毒", en: null }],
    breakdown: [
      { part: "de", type: "none" },
      { part: "tox", type: "root", zh: "毒", refId: "root-tox" },
      { part: "ification", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The body needs time for detoxification.", zh: "身体需要时间排毒。" }],
    assoc: { story: "构词:tox(毒) → 解毒" } },
  { id: "intoxication", word: "intoxication", phonetic: "/ɪnˌtɒksɪˈkeɪʃn/",
    senses: [{ pos: "n.", zh: "中毒；醉", en: "the state of being poisoned" }],
    breakdown: [
      { part: "in", type: "prefix", zh: "入", refId: "affix-in" },
      { part: "tox", type: "root", zh: "毒", refId: "root-tox" },
      { part: "ication", type: "none", zh: "…的状态" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Intoxication is dangerous.", zh: "醉酒很危险。" }],
    assoc: { story: "构词:in(入) + tox(毒) → 中毒" } },
  { id: "detox", word: "detox", phonetic: "/ˈdiːtɒks/",
    senses: [{ pos: "n.", zh: "解毒", en: "removal of poison" }],
    breakdown: [
      { part: "de", type: "prefix", zh: "离开", refId: "affix-de" },
      { part: "tox", type: "root", zh: "毒", refId: "root-tox" }
    ],
    tags: ["cet6"],
    examples: [{ en: "She went to a detox clinic.", zh: "她去了排毒诊所。" }],
    assoc: { story: "构词:de(离开) + tox(毒) → 解毒" } },
  { id: "toxicology", word: "toxicology", phonetic: "/ˌtɒksɪˈkɒlədʒi/",
    senses: [{ pos: "n.", zh: "毒理学", en: "the study of poisons" }],
    breakdown: [
      { part: "tox", type: "root", zh: "毒", refId: "root-tox" },
      { part: "ic", type: "suffix", zh: "…的", refId: "affix-ic" },
      { part: "o", type: "none" },
      { part: "log", type: "none", zh: "说/学科" },
      { part: "y", type: "suffix", zh: "…学", refId: "affix-y" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Toxicology tests chemicals.", zh: "毒理学检测化学品。" }],
    assoc: { story: "构词:tox(毒) + ic(…的) + y(…学) → 毒理学" } },
];
module.exports = words;
