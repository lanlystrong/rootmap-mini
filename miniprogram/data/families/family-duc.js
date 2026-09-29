const words = [
  { id: "conduct", word: "conduct", phonetic: "/kənˈdʌkt/",
    senses: [{ pos: "v.", zh: "实施;进行", en: "to carry out an activity or process" }],
    breakdown: [
      { part: "con", type: "prefix", zh: "加强", refId: "affix-con" },
      { part: "duct", type: "root", zh: "引导", refId: "root-duc" }
    ],
    tags: ["cet4"],
    examples: [{ en: "The experiment was conducted by three scientists.", zh: "这项实验由三位科学家实施。" }],
    assoc: { story: "con(共同/加强)+duct(引导)= 引导整个过程 → 实施、进行。" } },
  { id: "introduce", word: "introduce", phonetic: "/ˌɪntrəˈdjuːs/",
    senses: [{ pos: "v.", zh: "介绍", en: "to tell someone another person’s name for the first time" }],
    breakdown: [
      { part: "intro", type: "prefix", zh: "向内", refId: "affix-intro" },
      { part: "duc", type: "root", zh: "引导", refId: "root-duc" },
      { part: "e", type: "none" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "Let me introduce my friend Tom.", zh: "让我介绍一下我的朋友汤姆。" }],
    assoc: { story: "intro(向内)+duc(引导)+e = 把(人或事物)领进来 → 介绍、引进。" } },
  { id: "production", word: "production", phonetic: "/prəˈdʌkʃn/",
    senses: [{ pos: "n.", zh: "生产;制造", en: "the process of making or growing something" }],
    breakdown: [
      { part: "pro", type: "prefix", zh: "向前/带出", refId: "affix-pro" },
      { part: "duct", type: "root", zh: "引导", refId: "root-duc" },
      { part: "ion", type: "suffix", zh: "名词后缀", refId: "affix-ion" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "Production will increase next year.", zh: "明年产量将增加。" }],
    assoc: { story: undefined } },
  { id: "educate", word: "educate", phonetic: "/ˈedʒukeɪt/",
    senses: [{ pos: "v.", zh: "教育", en: "to teach and train" }],
    breakdown: [
      { part: "e", type: "prefix", zh: "出", refId: "affix-e" },
      { part: "duc", type: "root", zh: "引导", refId: "root-duc" },
      { part: "ate", type: "suffix", zh: "使…", refId: "affix-ate" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Schools educate the next generation.", zh: "学校培育下一代。" }],
    assoc: { story: "构词:e(出) + duc(引导) + ate(使…) → 教育" } },
  { id: "produce", word: "produce", phonetic: "/prəˈdjuːs/",
    senses: [{ pos: "v.", zh: "生产；制造", en: "to make or create" }],
    breakdown: [
      { part: "pro", type: "prefix", zh: "向前", refId: "affix-pro" },
      { part: "duc", type: "root", zh: "引导", refId: "root-duc" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The factory produces cars.", zh: "工厂生产汽车。" }],
    assoc: { story: "构词:pro(向前) + duc(引导) → 生产" } },
  { id: "reduce", word: "reduce", phonetic: "/rɪˈdjuːs/",
    senses: [{ pos: "v.", zh: "减少", en: "to make smaller" }],
    breakdown: [
      { part: "re", type: "prefix", zh: "回", refId: "affix-re" },
      { part: "duc", type: "root", zh: "引导", refId: "root-duc" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "We must reduce waste.", zh: "我们必须减少浪费。" }],
    assoc: { story: "构词:re(回) + duc(引导) → 减少" } },
  { id: "deduct", word: "deduct", phonetic: "/dɪˈdʌkt/",
    senses: [{ pos: "v.", zh: "扣除", en: "to take away an amount" }],
    breakdown: [
      { part: "de", type: "prefix", zh: "离开", refId: "affix-de" },
      { part: "duct", type: "root", zh: "引导", refId: "root-duc" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Tax is deducted from your salary.", zh: "税款从工资中扣除。" }],
    assoc: { story: "构词:de(离开) + duct(引导) → 扣除" } },
  { id: "conductor", word: "conductor", phonetic: "/kənˈdʌktə/",
    senses: [{ pos: "n.", zh: "导体；指挥", en: "one who leads or transmits" }],
    breakdown: [
      { part: "con", type: "prefix", zh: "共同", refId: "affix-con" },
      { part: "duct", type: "root", zh: "引导", refId: "root-duc" },
      { part: "or", type: "suffix", zh: "…者", refId: "affix-or" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Metal is a good conductor of heat.", zh: "金属是热的良导体。" }],
    assoc: { story: "构词:con(共同) + duct(引导) + or(…者) → 导体" } },
  { id: "product", word: "product", phonetic: "/ˈprɒdʌkt/",
    senses: [{ pos: "n.", zh: "产品", en: "something made" }],
    breakdown: [
      { part: "pro", type: "prefix", zh: "向前", refId: "affix-pro" },
      { part: "duct", type: "root", zh: "引导", refId: "root-duc" }
    ],
    tags: ["cet6"],
    examples: [{ en: "This is our best-selling product.", zh: "这是我们最畅销的产品。" }],
    assoc: { story: "构词:pro(向前) + duct(引导) → 产品" } },
];
module.exports = words;
