const words = [
  { id: "value", word: "value", phonetic: "/ˈvæljuː/",
    senses: [{ pos: "n.", zh: "价值;重要性", en: "how much something is worth; the importance of something" }],
    breakdown: [
      { part: "val", type: "root", zh: "价值/力量", refId: "root-val" },
      { part: "ue", type: "none" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "The value of this painting has risen sharply.", zh: "这幅画的价值大幅上涨。" }],
    assoc: { story: "val(价值/强)+ue = 东西「值」多少 → 价值;看重它 → 重视。" } },
  { id: "valuable", word: "valuable", phonetic: "/ˈvæljuəbl/",
    senses: [{ pos: "adj.", zh: "贵重的;有价值的", en: "worth a lot of money; very useful or important" }],
    breakdown: [
      { part: "val", type: "root", zh: "价值", refId: "root-val" },
      { part: "u", type: "none" },
      { part: "able", type: "suffix", zh: "可…的", refId: "affix-able" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "The museum keeps many valuable paintings.", zh: "博物馆收藏了许多珍贵的画作。" }],
    assoc: { story: undefined } },
  { id: "valid", word: "valid", phonetic: "/ˈvælɪd/",
    senses: [{ pos: "adj.", zh: "有效的;正当的", en: "legally or officially acceptable; based on good reasons" }],
    breakdown: [
      { part: "val", type: "root", zh: "价值/力量", refId: "root-val" },
      { part: "id", type: "none" }
    ],
    tags: ["cet4"],
    examples: [{ en: "You need a valid passport to travel abroad.", zh: "出国旅行需要有效护照。" }],
    assoc: { story: undefined } },
  { id: "evaluate", word: "evaluate", phonetic: "/ɪˈvæljueɪt/",
    senses: [{ pos: "v.", zh: "评价", en: "to judge the value" }],
    breakdown: [
      { part: "e", type: "prefix", zh: "出", refId: "affix-e" },
      { part: "val", type: "root", zh: "价值/力量", refId: "root-val" },
      { part: "u", type: "none" },
      { part: "ate", type: "suffix", zh: "使…", refId: "affix-ate" }
    ],
    tags: ["cet6"],
    examples: [{ en: "We evaluated the proposal.", zh: "我们评估了该提案。" }],
    assoc: { story: "构词:e(出) + val(价值/力量) + ate(使…) → 评价" } },
  { id: "equivalent", word: "equivalent", phonetic: "/ɪˈkwɪvələnt/",
    senses: [{ pos: "adj.", zh: "等价的", en: "equal in value" }],
    breakdown: [
      { part: "equi", type: "prefix", zh: "等", refId: "affix-equi" },
      { part: "val", type: "root", zh: "价值/力量", refId: "root-val" },
      { part: "ent", type: "suffix", zh: "…的", refId: "affix-ent" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Ten dollars is equivalent to sixty yuan.", zh: "十美元相当于六十元。" }],
    assoc: { story: "构词:equi(等) + val(价值/力量) + ent(…的) → 等价的" } },
  { id: "prevail", word: "prevail", phonetic: "/prɪˈveɪl/",
    senses: [{ pos: "v.", zh: "盛行；占上风", en: "to win out" }],
    breakdown: [
      { part: "pre", type: "prefix", zh: "先", refId: "affix-pre" },
      { part: "vail", type: "root", zh: "价值/力量", refId: "root-val" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Justice will prevail.", zh: "正义终将胜利。" }],
    assoc: { story: "构词:pre(先) + vail(价值/力量) → 盛行" } },
  { id: "invalid", word: "invalid", phonetic: "/ɪnˈvælɪd/",
    senses: [{ pos: "adj.", zh: "无效的", en: "not valid" }],
    breakdown: [
      { part: "in", type: "prefix", zh: "不", refId: "affix-in" },
      { part: "val", type: "root", zh: "价值/力量", refId: "root-val" },
      { part: "id", type: "none", zh: "…的" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The ticket was invalid.", zh: "这张票无效。" }],
    assoc: { story: "构词:in(不) + val(价值/力量) → 无效的" } },
  { id: "available", word: "available", phonetic: "/əˈveɪləbl/",
    senses: [{ pos: "adj.", zh: "可用的", en: "able to be used" }],
    breakdown: [
      { part: "a", type: "prefix", zh: "朝向", refId: "affix-a" },
      { part: "vail", type: "root", zh: "价值/力量", refId: "root-val" },
      { part: "able", type: "suffix", zh: "可…的", refId: "affix-able" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Is the room available?", zh: "这个房间可用吗？" }],
    assoc: { story: "构词:a(朝向) + vail(价值/力量) + able(可…的) → 可用的" } },
  { id: "valor", word: "valor", phonetic: "/ˈvælə/",
    senses: [{ pos: "n.", zh: "勇气", en: "great bravery" }],
    breakdown: [
      { part: "val", type: "root", zh: "价值/力量", refId: "root-val" },
      { part: "or", type: "suffix", zh: "…者", refId: "affix-or" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The soldier showed valor.", zh: "士兵展现了勇气。" }],
    assoc: { story: "构词:val(价值/力量) + or(…者) → 勇气" } },
];
module.exports = words;
