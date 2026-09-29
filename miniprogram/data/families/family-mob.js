const words = [
  { id: "mobile", word: "mobile", phonetic: "/ˈməʊbaɪl/",
    senses: [{ pos: "adj.", zh: "可移动的;流动的", en: "able to move or be moved easily" }],
    breakdown: [
      { part: "mob", type: "root", zh: "动", refId: "root-mob" },
      { part: "ile", type: "suffix", zh: "可…的", refId: "affix-ile" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "Most people now carry a mobile phone.", zh: "现在大多数人随身带着手机。" }],
    assoc: { story: "mob(动)+ile(可…的) = 可动的 → 可移动的、流动的;mobile phone 简称手机。" } },
  { id: "movie", word: "movie", phonetic: "/ˈmuːvi/",
    senses: [{ pos: "n.", zh: "电影", en: "a story shown in moving pictures, usually in a cinema" }],
    breakdown: [
      { part: "mov", type: "root", zh: "动", refId: "root-mob" },
      { part: "ie", type: "none" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "We watched a movie at the cinema.", zh: "我们在电影院看了一部电影。" }],
    assoc: { story: "mov(动)+ie = moving picture(会动的画面)的缩略 → 电影。" } },
  { id: "emotion", word: "emotion", phonetic: "/ɪˈməʊʃn/",
    senses: [{ pos: "n.", zh: "情感;情绪", en: "a strong feeling such as love, anger or joy" }],
    breakdown: [
      { part: "e", type: "prefix", zh: "出/向外", refId: "affix-e" },
      { part: "mot", type: "root", zh: "动", refId: "root-mob" },
      { part: "ion", type: "suffix", zh: "名词后缀", refId: "affix-ion" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "She was shaking with emotion.", zh: "她激动得发抖。" }],
    assoc: { story: "e(出)+mot(动)+ion = 心中涌动而出的感受 → 情感、情绪。" } },
  { id: "promote", word: "promote", phonetic: "/prəˈməʊt/",
    senses: [{ pos: "v.", zh: "促进;推动", en: "to help something develop or succeed" }],
    breakdown: [
      { part: "pro", type: "prefix", zh: "向前", refId: "affix-pro" },
      { part: "mot", type: "root", zh: "动", refId: "root-mob" },
      { part: "e", type: "none" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "The meeting is to promote cooperation.", zh: "这次会议旨在促进合作。" }],
    assoc: { story: "pro(向前)+mot(动)+e = 推着往前走 → 促进;把人往前推 → 提升。" } },
  { id: "motivate", word: "motivate", phonetic: "/ˈməʊtɪveɪt/",
    senses: [{ pos: "v.", zh: "激励;激发", en: "to make someone want to do something" }],
    breakdown: [
      { part: "mot", type: "root", zh: "动", refId: "root-mob" },
      { part: "iv", type: "none" },
      { part: "ate", type: "suffix", zh: "动词后缀", refId: "affix-ate" }
    ],
    tags: ["cet6"],
    examples: [{ en: "A good teacher knows how to motivate students.", zh: "好老师懂得如何激励学生。" }],
    assoc: { story: "mot(动)+iv+ate = 使人动起来 → 激励、激发。" } },
  { id: "motion", word: "motion", phonetic: "/ˈməʊʃn/",
    senses: [{ pos: "n.", zh: "运动", en: "a movement" }],
    breakdown: [
      { part: "mot", type: "root", zh: "动", refId: "root-mob" },
      { part: "ion", type: "suffix", zh: "…的状态", refId: "affix-ion" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The motion was smooth.", zh: "运动很平稳。" }],
    assoc: { story: "构词:mot(动) + ion(…的状态) → 运动" } },
  { id: "motor", word: "motor", phonetic: "/ˈməʊtə/",
    senses: [{ pos: "n.", zh: "发动机", en: "a machine that moves" }],
    breakdown: [
      { part: "mot", type: "root", zh: "动", refId: "root-mob" },
      { part: "or", type: "suffix", zh: "…者", refId: "affix-or" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The motor needs repair.", zh: "发动机需要修理。" }],
    assoc: { story: "构词:mot(动) + or(…者) → 发动机" } },
  { id: "remote", word: "remote", phonetic: "/rɪˈməʊt/",
    senses: [{ pos: "adj.", zh: "遥远的", en: "far away" }],
    breakdown: [
      { part: "re", type: "prefix", zh: "回", refId: "affix-re" },
      { part: "mot", type: "root", zh: "动", refId: "root-mob" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He lives in a remote village.", zh: "他住在偏远的村庄。" }],
    assoc: { story: "构词:re(回) + mot(动) → 遥远的" } },
  { id: "remove", word: "remove", phonetic: "/rɪˈmuːv/",
    senses: [{ pos: "v.", zh: "移除", en: "to take away" }],
    breakdown: [
      { part: "re", type: "prefix", zh: "回", refId: "affix-re" },
      { part: "mov", type: "root", zh: "动", refId: "root-mob" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Please remove your shoes.", zh: "请脱鞋。" }],
    assoc: { story: "构词:re(回) + mov(动) → 移除" } },
  { id: "motive", word: "motive", phonetic: "/ˈməʊtɪv/",
    senses: [{ pos: "n.", zh: "动机", en: "a reason for action" }],
    breakdown: [
      { part: "mot", type: "root", zh: "动", refId: "root-mob" },
      { part: "ive", type: "suffix", zh: "…的", refId: "affix-ive" }
    ],
    tags: ["cet6"],
    examples: [{ en: "What was his motive?", zh: "他的动机是什么？" }],
    assoc: { story: "构词:mot(动) + ive(…的) → 动机" } },
  { id: "automobile", word: "automobile", phonetic: "/ˈɔːtəməbiːl/",
    senses: [{ pos: "n.", zh: "汽车", en: "a self-moving vehicle" }],
    breakdown: [
      { part: "auto", type: "prefix", zh: "自己", refId: "affix-auto" },
      { part: "mob", type: "root", zh: "动", refId: "root-mob" },
      { part: "ile", type: "suffix", zh: "可…的", refId: "affix-ile" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The automobile broke down.", zh: "汽车抛锚了。" }],
    assoc: { story: "构词:auto(自己) + mob(动) + ile(可…的) → 汽车" } },
  { id: "movement", word: "movement", phonetic: "/ˈmuːvmənt/",
    senses: [{ pos: "n.", zh: "运动", en: "a group or act of moving" }],
    breakdown: [
      { part: "mov", type: "root", zh: "动", refId: "root-mob" },
      { part: "ement", type: "none", zh: "…的结果" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The movement grew fast.", zh: "运动迅速发展。" }],
    assoc: { story: "构词:mov(动) → 运动" } },
];
module.exports = words;
