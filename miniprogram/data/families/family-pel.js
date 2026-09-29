const words = [
  { id: "impulse", word: "impulse", phonetic: "/ˈɪmpʌls/",
    senses: [{ pos: "n.", zh: "冲动;一时的念头", en: "a sudden strong wish to do something without thinking" }],
    breakdown: [
      { part: "im", type: "prefix", zh: "向内", refId: "affix-im" },
      { part: "puls", type: "root", zh: "推", refId: "root-pel" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "She bought the dress on impulse.", zh: "她一时冲动买了那条裙子。" }],
    assoc: { story: "im(向内)+puls(推)+e = 心里被猛地一推 → 冲动;脉冲。" } },
  { id: "compel", word: "compel", phonetic: "/kəmˈpel/",
    senses: [{ pos: "v.", zh: "强迫", en: "to force" }],
    breakdown: [
      { part: "com", type: "prefix", zh: "共同", refId: "affix-com" },
      { part: "pel", type: "root", zh: "推/驱", refId: "root-pel" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Nothing can compel him to lie.", zh: "没什么能逼他说谎。" }],
    assoc: { story: "构词:com(共同) + pel(推/驱) → 强迫" } },
  { id: "expel", word: "expel", phonetic: "/ɪkˈspel/",
    senses: [{ pos: "v.", zh: "驱逐；开除", en: "to force out" }],
    breakdown: [
      { part: "ex", type: "prefix", zh: "出", refId: "affix-ex" },
      { part: "pel", type: "root", zh: "推/驱", refId: "root-pel" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The student was expelled.", zh: "那名学生被开除了。" }],
    assoc: { story: "构词:ex(出) + pel(推/驱) → 驱逐" } },
  { id: "propel", word: "propel", phonetic: "/prəˈpel/",
    senses: [{ pos: "v.", zh: "推进", en: "to drive forward" }],
    breakdown: [
      { part: "pro", type: "prefix", zh: "向前", refId: "affix-pro" },
      { part: "pel", type: "root", zh: "推/驱", refId: "root-pel" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The engine propels the ship.", zh: "引擎推动船只前进。" }],
    assoc: { story: "构词:pro(向前) + pel(推/驱) → 推进" } },
  { id: "repel", word: "repel", phonetic: "/rɪˈpel/",
    senses: [{ pos: "v.", zh: "击退；排斥", en: "to push back" }],
    breakdown: [
      { part: "re", type: "prefix", zh: "回", refId: "affix-re" },
      { part: "pel", type: "root", zh: "推/驱", refId: "root-pel" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The shield repelled the attack.", zh: "盾牌挡开了攻击。" }],
    assoc: { story: "构词:re(回) + pel(推/驱) → 击退" } },
  { id: "pulse", word: "pulse", phonetic: "/pʌls/",
    senses: [{ pos: "n.", zh: "脉搏", en: "the beat of the heart" }],
    breakdown: [
      { part: "puls", type: "root", zh: "推/驱", refId: "root-pel" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The doctor checked his pulse.", zh: "医生检查了他的脉搏。" }],
    assoc: { story: "构词:puls(推/驱) → 脉搏" } },
  { id: "compulsory", word: "compulsory", phonetic: "/kəmˈpʌlsəri/",
    senses: [{ pos: "adj.", zh: "强制的", en: "required by rule" }],
    breakdown: [
      { part: "com", type: "prefix", zh: "共同", refId: "affix-com" },
      { part: "puls", type: "root", zh: "推/驱", refId: "root-pel" },
      { part: "ory", type: "suffix", zh: "…的", refId: "affix-ory" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Education is compulsory.", zh: "教育是义务的。" }],
    assoc: { story: "构词:com(共同) + puls(推/驱) + ory(…的) → 强制的" } },
];
module.exports = words;
