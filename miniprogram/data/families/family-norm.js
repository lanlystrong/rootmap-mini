const words = [
  { id: "normal", word: "normal", phonetic: "/ˈnɔːml/",
    senses: [{ pos: "adj.", zh: "正常的;普通的", en: "usual, typical or expected" }],
    breakdown: [
      { part: "norm", type: "root", zh: "规则/标准", refId: "root-norm" },
      { part: "al", type: "suffix", zh: "…的", refId: "affix-al" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "It is normal to feel nervous before an exam.", zh: "考试前感到紧张是正常的。" }],
    assoc: { story: "norm(标准)+al = 合乎标准的 → 正常的。" } },
  { id: "enormous", word: "enormous", phonetic: "/ɪˈnɔːməs/",
    senses: [{ pos: "adj.", zh: "巨大的;庞大的", en: "extremely large" }],
    breakdown: [
      { part: "e", type: "prefix", zh: "出/超出", refId: "affix-e" },
      { part: "norm", type: "root", zh: "规则/标准", refId: "root-norm" },
      { part: "ous", type: "suffix", zh: "…的", refId: "affix-ous" }
    ],
    tags: ["cet4"],
    examples: [{ en: "They spent an enormous amount of money.", zh: "他们花了一大笔钱。" }],
    assoc: { story: "e(超出)+norm(常规)+ous = 超出常规大小的 → 巨大的。" } },
  { id: "abnormal", word: "abnormal", phonetic: "/æbˈnɔːml/",
    senses: [{ pos: "adj.", zh: "反常的", en: "not normal" }],
    breakdown: [
      { part: "ab", type: "prefix", zh: "偏离", refId: "affix-ab" },
      { part: "norm", type: "root", zh: "规则", refId: "root-norm" },
      { part: "al", type: "suffix", zh: "…的", refId: "affix-al" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The test showed abnormal results.", zh: "检测显示异常结果。" }],
    assoc: { story: "构词:ab(偏离) + norm(规则) + al(…的) → 反常的" } },
  { id: "norm", word: "norm", phonetic: "/nɔːm/",
    senses: [{ pos: "n.", zh: "规范", en: "a standard" }],
    breakdown: [
      { part: "norm", type: "root", zh: "规则", refId: "root-norm" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Honesty is the norm.", zh: "诚实是常态。" }],
    assoc: { story: "构词:norm(规则) → 规范" } },
  { id: "normalize", word: "normalize", phonetic: "/ˈnɔːməlaɪz/",
    senses: [{ pos: "v.", zh: "使规范化", en: "to make standard" }],
    breakdown: [
      { part: "norm", type: "root", zh: "规则", refId: "root-norm" },
      { part: "al", type: "suffix", zh: "…的", refId: "affix-al" },
      { part: "ize", type: "none", zh: "使…" }
    ],
    tags: ["cet6"],
    examples: [{ en: "They normalized relations.", zh: "他们使关系正常化。" }],
    assoc: { story: "构词:norm(规则) + al(…的) → 使规范化" } },
];
module.exports = words;
