const words = [
  { id: "transmit", word: "transmit", phonetic: "/trænzˈmɪt/",
    senses: [{ pos: "v.", zh: "传送;发射", en: "to send out electronic signals or messages" }],
    breakdown: [
      { part: "trans", type: "prefix", zh: "横穿/转移", refId: "affix-trans" },
      { part: "mit", type: "root", zh: "送", refId: "root-mit" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The data was transmitted by radio.", zh: "数据通过无线电传送。" }],
    assoc: { story: "trans(从一处到另一处)+mit(送)= 送过去 → 传送、传播。" } },
  { id: "mission", word: "mission", phonetic: "/ˈmɪʃn/",
    senses: [{ pos: "n.", zh: "使命;任务", en: "an important job that someone is sent to do" }],
    breakdown: [
      { part: "miss", type: "root", zh: "送", refId: "root-mit" },
      { part: "ion", type: "suffix", zh: "名词后缀", refId: "affix-ion" }
    ],
    tags: ["cet4"],
    examples: [{ en: "Their mission is to help poor children.", zh: "他们的使命是帮助贫困儿童。" }],
    assoc: { story: "miss(送出)+ion = 被派出去的任务 → 使命。" } },
  { id: "submit", word: "submit", phonetic: "/səbˈmɪt/",
    senses: [{ pos: "v.", zh: "提交；屈服", en: "to hand in or yield" }],
    breakdown: [
      { part: "sub", type: "prefix", zh: "在下", refId: "affix-sub" },
      { part: "mit", type: "root", zh: "送/放出", refId: "root-mit" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Please submit your essay by Friday.", zh: "请于周五前提交论文。" }],
    assoc: { story: "构词:sub(在下) + mit(送/放出) → 提交" } },
  { id: "commit", word: "commit", phonetic: "/kəˈmɪt/",
    senses: [{ pos: "v.", zh: "犯(错)；承诺", en: "to do something wrong or pledge" }],
    breakdown: [
      { part: "com", type: "prefix", zh: "共同", refId: "affix-com" },
      { part: "mit", type: "root", zh: "送/放出", refId: "root-mit" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He committed a serious mistake.", zh: "他犯了一个严重错误。" }],
    assoc: { story: "构词:com(共同) + mit(送/放出) → 犯(错)" } },
  { id: "permit", word: "permit", phonetic: "/pəˈmɪt/",
    senses: [{ pos: "v.", zh: "允许", en: "to allow" }],
    breakdown: [
      { part: "per", type: "prefix", zh: "通过", refId: "affix-per" },
      { part: "mit", type: "root", zh: "送/放出", refId: "root-mit" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Smoking is not permitted here.", zh: "此处禁止吸烟。" }],
    assoc: { story: "构词:per(通过) + mit(送/放出) → 允许" } },
  { id: "admit", word: "admit", phonetic: "/ədˈmɪt/",
    senses: [{ pos: "v.", zh: "承认；准许进入", en: "to confess or let in" }],
    breakdown: [
      { part: "ad", type: "prefix", zh: "去", refId: "affix-ad" },
      { part: "mit", type: "root", zh: "送/放出", refId: "root-mit" }
    ],
    tags: ["cet6"],
    examples: [{ en: "She admitted her error.", zh: "她承认了错误。" }],
    assoc: { story: "构词:ad(去) + mit(送/放出) → 承认" } },
  { id: "emit", word: "emit", phonetic: "/iːˈmɪt/",
    senses: [{ pos: "v.", zh: "发出；散发", en: "to send out" }],
    breakdown: [
      { part: "e", type: "prefix", zh: "出", refId: "affix-e" },
      { part: "mit", type: "root", zh: "送/放出", refId: "root-mit" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The chimney emitted black smoke.", zh: "烟囱冒出黑烟。" }],
    assoc: { story: "构词:e(出) + mit(送/放出) → 发出" } },
  { id: "omit", word: "omit", phonetic: "/əʊˈmɪt/",
    senses: [{ pos: "v.", zh: "省略；遗漏", en: "to leave out" }],
    breakdown: [
      { part: "o", type: "prefix", zh: "逆", refId: "affix-ob" },
      { part: "mit", type: "root", zh: "送/放出", refId: "root-mit" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Do not omit any details.", zh: "不要遗漏任何细节。" }],
    assoc: { story: "构词:o(逆) + mit(送/放出) → 省略" } },
  { id: "dismiss", word: "dismiss", phonetic: "/dɪsˈmɪs/",
    senses: [{ pos: "v.", zh: "解散；驳回", en: "to send away or reject" }],
    breakdown: [
      { part: "dis", type: "prefix", zh: "分开", refId: "affix-dis" },
      { part: "miss", type: "root", zh: "送/放出", refId: "root-mit" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The class was dismissed early.", zh: "课间提前放学了。" }],
    assoc: { story: "构词:dis(分开) + miss(送/放出) → 解散" } },
  { id: "promise", word: "promise", phonetic: "/ˈprɒmɪs/",
    senses: [{ pos: "n.", zh: "承诺", en: "a pledge to do something" }],
    breakdown: [
      { part: "pro", type: "prefix", zh: "向前", refId: "affix-pro" },
      { part: "mis", type: "root", zh: "送/放出", refId: "root-mit" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He made a promise to help.", zh: "他承诺会帮忙。" }],
    assoc: { story: "构词:pro(向前) + mis(送/放出) → 承诺" } },
];
module.exports = words;
