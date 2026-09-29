const words = [
  { id: "predict", word: "predict", phonetic: "/prɪˈdɪkt/",
    senses: [{ pos: "v.", zh: "预言;预测", en: "to say what will happen in the future" }],
    breakdown: [
      { part: "pre", type: "prefix", zh: "预先", refId: "affix-pre" },
      { part: "dict", type: "root", zh: "说", refId: "root-dict" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "It is hard to predict the weather.", zh: "天气很难预测。" }],
    assoc: { story: "pre(预先)+dict(说)= 提前说出 → 预言、预测。" } },
  { id: "indicate", word: "indicate", phonetic: "/ˈɪndɪkeɪt/",
    senses: [{ pos: "v.", zh: "表明;显示", en: "to show that something is true or exists" }],
    breakdown: [
      { part: "in", type: "prefix", zh: "朝向/使", refId: "affix-in" },
      { part: "dic", type: "root", zh: "说", refId: "root-dict" },
      { part: "ate", type: "suffix", zh: "动词后缀", refId: "affix-ate" }
    ],
    tags: ["cet4"],
    examples: [{ en: "The results indicate that the plan works.", zh: "结果显示该计划可行。" }],
    assoc: { story: undefined } },
  { id: "dedicate", word: "dedicate", phonetic: "/ˈdedɪkeɪt/",
    senses: [{ pos: "v.", zh: "献身于;把…用于", en: "to give all your attention and effort to something" }],
    breakdown: [
      { part: "de", type: "prefix", zh: "加强", refId: "affix-de" },
      { part: "dic", type: "root", zh: "说", refId: "root-dict" },
      { part: "ate", type: "suffix", zh: "动词后缀", refId: "affix-ate" }
    ],
    tags: ["cet6"],
    examples: [{ en: "She dedicated her life to helping the poor.", zh: "她将一生奉献给帮助穷人。" }],
    assoc: { story: undefined } },
  { id: "dictionary", word: "dictionary", phonetic: "/ˈdɪkʃənri/",
    senses: [{ pos: "n.", zh: "字典", en: "a book of word meanings" }],
    breakdown: [
      { part: "dict", type: "root", zh: "说", refId: "root-dict" },
      { part: "ionary", type: "none", zh: "…的物" }
    ],
    tags: ["cet6"],
    examples: [{ en: "I looked up the word in a dictionary.", zh: "我在字典里查了这个单词。" }],
    assoc: { story: "构词:dict(说) → 字典" } },
  { id: "dictate", word: "dictate", phonetic: "/dɪkˈteɪt/",
    senses: [{ pos: "v.", zh: "口述；命令", en: "to say words for others to write" }],
    breakdown: [
      { part: "dict", type: "root", zh: "说", refId: "root-dict" },
      { part: "ate", type: "suffix", zh: "使…", refId: "affix-ate" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The boss dictated a letter to his secretary.", zh: "老板向秘书口述了一封信。" }],
    assoc: { story: "构词:dict(说) + ate(使…) → 口述" } },
  { id: "dictator", word: "dictator", phonetic: "/ˈdɪkteɪtə/",
    senses: [{ pos: "n.", zh: "独裁者", en: "a ruler with total power" }],
    breakdown: [
      { part: "dict", type: "root", zh: "说", refId: "root-dict" },
      { part: "ator", type: "suffix", zh: "…的人", refId: "affix-ator" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The dictator ruled the country by force.", zh: "独裁者靠武力统治国家。" }],
    assoc: { story: "构词:dict(说) + ator(…的人) → 独裁者" } },
  { id: "contradict", word: "contradict", phonetic: "/ˌkɒntrəˈdɪkt/",
    senses: [{ pos: "v.", zh: "反驳；矛盾", en: "to say the opposite of" }],
    breakdown: [
      { part: "contra", type: "prefix", zh: "相反", refId: "affix-contra" },
      { part: "dict", type: "root", zh: "说", refId: "root-dict" }
    ],
    tags: ["cet6"],
    examples: [{ en: "His story contradicts the facts.", zh: "他的说法与事实矛盾。" }],
    assoc: { story: "构词:contra(相反) + dict(说) → 反驳" } },
  { id: "addict", word: "addict", phonetic: "/ˈædɪkt/",
    senses: [{ pos: "n.", zh: "瘾君子", en: "a person unable to stop a habit" }],
    breakdown: [
      { part: "ad", type: "prefix", zh: "去", refId: "affix-ad" },
      { part: "dict", type: "root", zh: "说", refId: "root-dict" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He is a coffee addict.", zh: "他是个咖啡成瘾者。" }],
    assoc: { story: "构词:ad(去) + dict(说) → 瘾君子" } },
  { id: "verdict", word: "verdict", phonetic: "/ˈvɜːdɪkt/",
    senses: [{ pos: "n.", zh: "裁决", en: "a decision in a court" }],
    breakdown: [
      { part: "ver", type: "none", zh: "真" },
      { part: "dict", type: "root", zh: "说", refId: "root-dict" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The jury reached a verdict.", zh: "陪审团作出了裁决。" }],
    assoc: { story: "构词:dict(说) → 裁决" } },
];
module.exports = words;
