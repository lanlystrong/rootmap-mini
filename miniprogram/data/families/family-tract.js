const words = [
  { id: "attract", word: "attract", phonetic: "/əˈtrækt/",
    senses: [{ pos: "v.", zh: "吸引;引起", en: "to make someone interested in or drawn to something" }],
    breakdown: [
      { part: "at", type: "prefix", zh: "朝向", refId: "affix-ad" },
      { part: "tract", type: "root", zh: "拉", refId: "root-tract" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "The show attracted thousands of visitors.", zh: "这场演出吸引了成千上万的游客。" }],
    assoc: { story: "at(ad- 的变体,朝向)+tract(拉)= 拉到身边来 → 吸引。" } },
  { id: "tractor", word: "tractor", phonetic: "/ˈtræktə/",
    senses: [{ pos: "n.", zh: "拖拉机;牵引机", en: "a strong vehicle used on farms to pull machinery" }],
    breakdown: [
      { part: "tract", type: "root", zh: "拉", refId: "root-tract" },
      { part: "or", type: "suffix", zh: "…的机器", refId: "affix-or" }
    ],
    tags: ["cet4"],
    examples: [{ en: "The farmer drives a tractor.", zh: "农夫开着拖拉机。" }],
    assoc: { story: "tract(拉)+or(…的机器)= 用来拉东西的车 → 拖拉机。" } },
  { id: "contract", word: "contract", phonetic: "/ˈkɒntrækt/",
    senses: [{ pos: "n.", zh: "合同", en: "a written agreement" }],
    breakdown: [
      { part: "con", type: "prefix", zh: "共同", refId: "affix-con" },
      { part: "tract", type: "root", zh: "拉/拖", refId: "root-tract" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Both sides signed the contract.", zh: "双方签署了合同。" }],
    assoc: { story: "构词:con(共同) + tract(拉/拖) → 合同" } },
  { id: "extract", word: "extract", phonetic: "/ɪkˈstrækt/",
    senses: [{ pos: "v.", zh: "提取", en: "to pull out" }],
    breakdown: [
      { part: "ex", type: "prefix", zh: "出", refId: "affix-ex" },
      { part: "tract", type: "root", zh: "拉/拖", refId: "root-tract" }
    ],
    tags: ["cet6"],
    examples: [{ en: "We extracted juice from the fruit.", zh: "我们从水果中榨出汁。" }],
    assoc: { story: "构词:ex(出) + tract(拉/拖) → 提取" } },
  { id: "distract", word: "distract", phonetic: "/dɪˈstrækt/",
    senses: [{ pos: "v.", zh: "使分心", en: "to draw attention away" }],
    breakdown: [
      { part: "dis", type: "prefix", zh: "分开", refId: "affix-dis" },
      { part: "tract", type: "root", zh: "拉/拖", refId: "root-tract" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Noise distracted the students.", zh: "噪音使学生分心。" }],
    assoc: { story: "构词:dis(分开) + tract(拉/拖) → 使分心" } },
  { id: "subtract", word: "subtract", phonetic: "/səbˈtrækt/",
    senses: [{ pos: "v.", zh: "减去", en: "to take away a number" }],
    breakdown: [
      { part: "sub", type: "prefix", zh: "在下", refId: "affix-sub" },
      { part: "tract", type: "root", zh: "拉/拖", refId: "root-tract" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Subtract three from ten.", zh: "十减去三。" }],
    assoc: { story: "构词:sub(在下) + tract(拉/拖) → 减去" } },
];
module.exports = words;
