const words = [
  { id: "logic", word: "logic", phonetic: "/ˈlɒdʒɪk/",
    senses: [{ pos: "n.", zh: "逻辑;逻辑学", en: "the science of correct reasoning; sound judgment" }],
    breakdown: [
      { part: "log", type: "root", zh: "话语/理性", refId: "root-log" },
      { part: "ic", type: "suffix", zh: "…学/…的", refId: "affix-ic" }
    ],
    tags: ["cet4"],
    examples: [{ en: "There is no logic in his argument.", zh: "他的论点毫无逻辑。" }],
    assoc: { story: "log(理性)+ic = 关于正确推理的学问 → 逻辑。" } },
  { id: "logical", word: "logical", phonetic: "/ˈlɒdʒɪkl/",
    senses: [{ pos: "adj.", zh: "合逻辑的;合理的", en: "reasonable and based on good judgment" }],
    breakdown: [
      { part: "log", type: "root", zh: "理性", refId: "root-log" },
      { part: "ic", type: "suffix", zh: "…的", refId: "affix-ic" },
      { part: "al", type: "suffix", zh: "…的", refId: "affix-al" }
    ],
    tags: ["cet4"],
    examples: [{ en: "It is a logical conclusion.", zh: "这是一个合乎逻辑的结论。" }],
    assoc: { story: undefined } },
  { id: "catalogue", word: "catalogue", phonetic: "/ˈkætəlɒɡ/",
    senses: [{ pos: "n.", zh: "目录;商品目录", en: "a complete list of items, often with details" }],
    breakdown: [
      { part: "cata", type: "prefix", zh: "向下/完全", refId: "affix-cata" },
      { part: "logue", type: "root", zh: "话语/罗列", refId: "root-log" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Please check the library catalogue online.", zh: "请在图书馆网站上查目录。" }],
    assoc: { story: "cata(完全)+logue(罗列) = 从头到尾列出来 → 目录。(美式拼作 catalog)" } },
  { id: "apology", word: "apology", phonetic: "/əˈpɒlədʒi/",
    senses: [{ pos: "n.", zh: "道歉;歉意", en: "a statement saying that you are sorry" }],
    breakdown: [
      { part: "apo", type: "prefix", zh: "离开/分开", refId: "affix-apo" },
      { part: "log", type: "root", zh: "话语", refId: "root-log" },
      { part: "y", type: "suffix", zh: "名词后缀", refId: "affix-y" }
    ],
    tags: ["cet4"],
    examples: [{ en: "Please accept my sincere apology.", zh: "请接受我真诚的道歉。" }],
    assoc: { story: "apo(分开)+log(话语)+y = 为自己的过失把话说开 → 道歉。" } },
  { id: "monologue", word: "monologue", phonetic: "/ˈmɒnəlɒɡ/",
    senses: [{ pos: "n.", zh: "独白;(戏剧中的)长篇台词", en: "a long speech by one person" }],
    breakdown: [
      { part: "mono", type: "prefix", zh: "单一", refId: "affix-mono" },
      { part: "logue", type: "root", zh: "话语", refId: "root-log" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The actor delivered a long monologue on stage.", zh: "演员在台上念了一段长长的独白。" }],
    assoc: { story: "mono(单一)+logue(话语) = 一个人独自说 → 独白。" } },
  { id: "dialogue", word: "dialogue", phonetic: "/ˈdaɪəlɒɡ/",
    senses: [{ pos: "n.", zh: "对话", en: "a talk between two" }],
    breakdown: [
      { part: "dia", type: "prefix", zh: "穿过", refId: "affix-dia" },
      { part: "log", type: "root", zh: "说/学科", refId: "root-log" },
      { part: "ue", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The dialogue was witty.", zh: "对话妙趣横生。" }],
    assoc: { story: "构词:dia(穿过) + log(说/学科) → 对话" } },
  { id: "biology", word: "biology", phonetic: "/baɪˈɒlədʒi/",
    senses: [{ pos: "n.", zh: "生物", en: "the study of life" }],
    breakdown: [
      { part: "bio", type: "none", zh: "生命" },
      { part: "log", type: "root", zh: "说/学科", refId: "root-log" },
      { part: "y", type: "suffix", zh: "…术", refId: "affix-y" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Biology fascinated her.", zh: "生物令她着迷。" }],
    assoc: { story: "构词:log(说/学科) + y(…术) → 生物" } },
  { id: "geology", word: "geology", phonetic: "/dʒiˈɒlədʒi/",
    senses: [{ pos: "n.", zh: "地质", en: "the study of Earth" }],
    breakdown: [
      { part: "geo", type: "none", zh: "地" },
      { part: "log", type: "root", zh: "说/学科", refId: "root-log" },
      { part: "y", type: "suffix", zh: "…术", refId: "affix-y" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Geology reveals Earth history.", zh: "地质揭示地球历史。" }],
    assoc: { story: "构词:log(说/学科) + y(…术) → 地质" } },
  { id: "psychology", word: "psychology", phonetic: "/saɪˈkɒlədʒi/",
    senses: [{ pos: "n.", zh: "心理", en: "the study of mind" }],
    breakdown: [
      { part: "psych", type: "none", zh: "灵魂" },
      { part: "o", type: "none" },
      { part: "log", type: "root", zh: "说/学科", refId: "root-log" },
      { part: "y", type: "suffix", zh: "…术", refId: "affix-y" }
    ],
    tags: ["cet6"],
    examples: [{ en: "She majors in psychology.", zh: "她主修心理学。" }],
    assoc: { story: "构词:log(说/学科) + y(…术) → 心理" } },
  { id: "technology", word: "technology", phonetic: "/tekˈnɒlədʒi/",
    senses: [{ pos: "n.", zh: "技术", en: "applied science" }],
    breakdown: [
      { part: "techno", type: "none", zh: "技艺" },
      { part: "log", type: "root", zh: "说/学科", refId: "root-log" },
      { part: "y", type: "suffix", zh: "…术", refId: "affix-y" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Technology changes fast.", zh: "技术变化很快。" }],
    assoc: { story: "构词:log(说/学科) + y(…术) → 技术" } },
  { id: "analogy", word: "analogy", phonetic: "/əˈnælədʒi/",
    senses: [{ pos: "n.", zh: "类比", en: "a comparison" }],
    breakdown: [
      { part: "ana", type: "none", zh: "回" },
      { part: "log", type: "root", zh: "说/学科", refId: "root-log" },
      { part: "y", type: "suffix", zh: "…术", refId: "affix-y" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He explained by analogy.", zh: "他用类比来解释。" }],
    assoc: { story: "构词:log(说/学科) + y(…术) → 类比" } },
  { id: "prologue", word: "prologue", phonetic: "/ˈprəʊlɒɡ/",
    senses: [{ pos: "n.", zh: "序言", en: "an opening part" }],
    breakdown: [
      { part: "pro", type: "prefix", zh: "向前", refId: "affix-pro" },
      { part: "logue", type: "root", zh: "说/学科", refId: "root-log" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The prologue sets the scene.", zh: "序言铺垫了背景。" }],
    assoc: { story: "构词:pro(向前) + logue(说/学科) → 序言" } },
];
module.exports = words;
