const words = [
  { id: "accept", word: "accept", phonetic: "/əkˈsept/",
    senses: [{ pos: "v.", zh: "接受;收受", en: "to take something that someone offers you" }],
    breakdown: [
      { part: "ac", type: "prefix", zh: "朝向", refId: "affix-ad" },
      { part: "cept", type: "root", zh: "拿/取", refId: "root-cept" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "She accepted the invitation.", zh: "她接受了邀请。" }],
    assoc: { story: "ac(ad- 朝向,在 c 前同化)+cept(拿)= 伸手去拿 → 接受、认可。" } },
  { id: "receive", word: "receive", phonetic: "/rɪˈsiːv/",
    senses: [{ pos: "v.", zh: "收到;接到", en: "to get something that someone sends or gives you" }],
    breakdown: [
      { part: "re", type: "prefix", zh: "回/向回", refId: "affix-re" },
      { part: "ceiv", type: "root", zh: "拿", refId: "root-cept" },
      { part: "e", type: "none" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "I received your email this morning.", zh: "我今天早上收到了你的邮件。" }],
    assoc: { story: "re(回)+ceiv(拿)+e = 拿回来 → 收到、接待。" } },
  { id: "deceive", word: "deceive", phonetic: "/dɪˈsiːv/",
    senses: [{ pos: "v.", zh: "欺骗;蒙蔽", en: "to make someone believe something that is not true" }],
    breakdown: [
      { part: "de", type: "prefix", zh: "使失去/贬抑", refId: "affix-de" },
      { part: "ceiv", type: "root", zh: "拿", refId: "root-cept" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He deceived the old lady into giving him money.", zh: "他骗老太太给他钱。" }],
    assoc: { story: "de(使失去)+ceiv(拿)+e = 用手段把人(的判断)拿走 → 欺骗。" } },
  { id: "concept", word: "concept", phonetic: "/ˈkɒnsept/",
    senses: [{ pos: "n.", zh: "概念", en: "an idea" }],
    breakdown: [
      { part: "con", type: "prefix", zh: "共同", refId: "affix-con" },
      { part: "cept", type: "root", zh: "拿/取", refId: "root-cept" }
    ],
    tags: ["cet6"],
    examples: [{ en: "This is a difficult concept.", zh: "这是个难懂的概念。" }],
    assoc: { story: "构词:con(共同) + cept(拿/取) → 概念" } },
  { id: "except", word: "except", phonetic: "/ɪkˈsept/",
    senses: [{ pos: "prep.", zh: "除…之外", en: "not including" }],
    breakdown: [
      { part: "ex", type: "prefix", zh: "出", refId: "affix-ex" },
      { part: "cept", type: "root", zh: "拿/取", refId: "root-cept" }
    ],
    tags: ["cet6"],
    examples: [{ en: "All came except him.", zh: "除了他全都来了。" }],
    assoc: { story: "构词:ex(出) + cept(拿/取) → 除…之外" } },
  { id: "perceive", word: "perceive", phonetic: "/pəˈsiːv/",
    senses: [{ pos: "v.", zh: "察觉；理解", en: "to become aware" }],
    breakdown: [
      { part: "per", type: "prefix", zh: "通过", refId: "affix-per" },
      { part: "ceiv", type: "root", zh: "拿/取", refId: "root-cept" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "She perceived a change in tone.", zh: "她察觉到语气的变化。" }],
    assoc: { story: "构词:per(通过) + ceiv(拿/取) → 察觉" } },
  { id: "deception", word: "deception", phonetic: "/dɪˈsepʃn/",
    senses: [{ pos: "n.", zh: "欺骗", en: "the act of deceiving" }],
    breakdown: [
      { part: "de", type: "prefix", zh: "离开", refId: "affix-de" },
      { part: "cept", type: "root", zh: "拿/取", refId: "root-cept" },
      { part: "ion", type: "suffix", zh: "…的状态", refId: "affix-ion" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The deception was soon found out.", zh: "骗局很快被识破。" }],
    assoc: { story: "构词:de(离开) + cept(拿/取) + ion(…的状态) → 欺骗" } },
  { id: "anticipate", word: "anticipate", phonetic: "/ænˈtɪsɪpeɪt/",
    senses: [{ pos: "v.", zh: "预期", en: "to expect" }],
    breakdown: [
      { part: "anti", type: "none", zh: "前" },
      { part: "cip", type: "root", zh: "拿/取", refId: "root-cept" },
      { part: "ate", type: "suffix", zh: "使…", refId: "affix-ate" }
    ],
    tags: ["cet6"],
    examples: [{ en: "We anticipate a busy week.", zh: "我们预计一周会很忙。" }],
    assoc: { story: "构词:cip(拿/取) + ate(使…) → 预期" } },
  { id: "participate", word: "participate", phonetic: "/pɑːˈtɪsɪpeɪt/",
    senses: [{ pos: "v.", zh: "参与", en: "to take part" }],
    breakdown: [
      { part: "part", type: "none", zh: "部分" },
      { part: "i", type: "none" },
      { part: "cip", type: "root", zh: "拿/取", refId: "root-cept" },
      { part: "ate", type: "suffix", zh: "使…", refId: "affix-ate" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Many students participated.", zh: "许多学生参与了。" }],
    assoc: { story: "构词:cip(拿/取) + ate(使…) → 参与" } },
  { id: "intercept", word: "intercept", phonetic: "/ˌɪntəˈsept/",
    senses: [{ pos: "v.", zh: "拦截", en: "to stop in between" }],
    breakdown: [
      { part: "inter", type: "prefix", zh: "之间", refId: "affix-inter" },
      { part: "cept", type: "root", zh: "拿/取", refId: "root-cept" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The missile was intercepted.", zh: "导弹被拦截。" }],
    assoc: { story: "构词:inter(之间) + cept(拿/取) → 拦截" } },
];
module.exports = words;
