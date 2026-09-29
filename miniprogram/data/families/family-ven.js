const words = [
  { id: "event", word: "event", phonetic: "/ɪˈvent/",
    senses: [{ pos: "n.", zh: "事件;大事", en: "something that happens, especially something important" }],
    breakdown: [
      { part: "e", type: "prefix", zh: "出", refId: "affix-e" },
      { part: "vent", type: "root", zh: "来", refId: "root-ven" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "The conference is the biggest event of the year.", zh: "这次大会是年度最大的活动。" }],
    assoc: { story: "e(ex- 出)+vent(来)= 发生出来的事 → 事件。" } },
  { id: "prevent", word: "prevent", phonetic: "/prɪˈvent/",
    senses: [{ pos: "v.", zh: "阻止;防止", en: "to stop something from happening" }],
    breakdown: [
      { part: "pre", type: "prefix", zh: "预先", refId: "affix-pre" },
      { part: "vent", type: "root", zh: "来", refId: "root-ven" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "Wash your hands to prevent disease.", zh: "勤洗手以预防疾病。" }],
    assoc: { story: "pre(预先)+vent(来)= 先来一步挡住 → 阻止、预防。" } },
  { id: "invention", word: "invention", phonetic: "/ɪnˈvenʃn/",
    senses: [{ pos: "n.", zh: "发明;创造", en: "a new thing that someone has made or created" }],
    breakdown: [
      { part: "in", type: "prefix", zh: "向内/使", refId: "affix-in" },
      { part: "vent", type: "root", zh: "来", refId: "root-ven" },
      { part: "ion", type: "suffix", zh: "名词后缀", refId: "affix-ion" }
    ],
    tags: ["cet4"],
    examples: [{ en: "The telephone is a great invention.", zh: "电话是一项伟大的发明。" }],
    assoc: { story: "in(使)+vent(来)+ion = 被创造出来的东西 → 发明。" } },
  { id: "convenient", word: "convenient", phonetic: "/kənˈviːniənt/",
    senses: [{ pos: "adj.", zh: "方便的;便利的", en: "useful and easy to do or use, causing no difficulty" }],
    breakdown: [
      { part: "con", type: "prefix", zh: "共同/合适", refId: "affix-con" },
      { part: "ven", type: "root", zh: "来", refId: "root-ven" },
      { part: "i", type: "none" },
      { part: "ent", type: "suffix", zh: "…的", refId: "affix-ent" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "It is convenient to shop online.", zh: "网上购物很方便。" }],
    assoc: { story: "con(合适地)+ven(来)+ient = 一切都凑合得来 → 方便的。" } },
  { id: "invent", word: "invent", phonetic: "/ɪnˈvent/",
    senses: [{ pos: "v.", zh: "发明", en: "to create something new" }],
    breakdown: [
      { part: "in", type: "prefix", zh: "入", refId: "affix-in" },
      { part: "vent", type: "root", zh: "来", refId: "root-ven" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Who invented the telephone?", zh: "谁发明了电话？" }],
    assoc: { story: "构词:in(入) + vent(来) → 发明" } },
  { id: "convention", word: "convention", phonetic: "/kənˈvenʃn/",
    senses: [{ pos: "n.", zh: "会议；惯例", en: "a meeting or custom" }],
    breakdown: [
      { part: "con", type: "prefix", zh: "共同", refId: "affix-con" },
      { part: "vent", type: "root", zh: "来", refId: "root-ven" },
      { part: "ion", type: "suffix", zh: "…的状态", refId: "affix-ion" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The convention was held in July.", zh: "大会于七月举行。" }],
    assoc: { story: "构词:con(共同) + vent(来) + ion(…的状态) → 会议" } },
  { id: "adventure", word: "adventure", phonetic: "/ədˈventʃə/",
    senses: [{ pos: "n.", zh: "冒险", en: "an exciting experience" }],
    breakdown: [
      { part: "ad", type: "prefix", zh: "去", refId: "affix-ad" },
      { part: "vent", type: "root", zh: "来", refId: "root-ven" },
      { part: "ure", type: "suffix", zh: "…的结果", refId: "affix-ure" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The trip was a real adventure.", zh: "这趟旅行堪称冒险。" }],
    assoc: { story: "构词:ad(去) + vent(来) + ure(…的结果) → 冒险" } },
  { id: "revenue", word: "revenue", phonetic: "/ˈrevənjuː/",
    senses: [{ pos: "n.", zh: "收入；税收", en: "income or tax" }],
    breakdown: [
      { part: "re", type: "prefix", zh: "回", refId: "affix-re" },
      { part: "ven", type: "root", zh: "来", refId: "root-ven" },
      { part: "ue", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The company increased its revenue.", zh: "公司增加了收入。" }],
    assoc: { story: "构词:re(回) + ven(来) → 收入" } },
  { id: "intervene", word: "intervene", phonetic: "/ˌɪntəˈviːn/",
    senses: [{ pos: "v.", zh: "干预", en: "to come between" }],
    breakdown: [
      { part: "inter", type: "prefix", zh: "之间", refId: "affix-inter" },
      { part: "ven", type: "root", zh: "来", refId: "root-ven" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The teacher intervened in the fight.", zh: "老师介入了打架。" }],
    assoc: { story: "构词:inter(之间) + ven(来) → 干预" } },
];
module.exports = words;
