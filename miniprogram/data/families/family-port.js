const words = [
  { id: "import", word: "import", phonetic: "/ɪmˈpɔːt/",
    senses: [{ pos: "v.", zh: "进口;输入", en: "to bring goods into a country from abroad" }],
    breakdown: [
      { part: "im", type: "prefix", zh: "向内", refId: "affix-im" },
      { part: "port", type: "root", zh: "搬运", refId: "root-port" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "The country imports most of its oil.", zh: "该国进口大部分石油。" }],
    assoc: { story: "im(向内)+port(搬)= 搬进来 → 进口。作名词时重音在首:/ˈɪmpɔːt/,指「进口(的商品)」。" } },
  { id: "transport", word: "transport", phonetic: "/trænˈspɔːt/",
    senses: [{ pos: "v.", zh: "运输;运送", en: "to carry goods or people from one place to another" }],
    breakdown: [
      { part: "trans", type: "prefix", zh: "转移/横穿", refId: "affix-trans" },
      { part: "port", type: "root", zh: "搬运", refId: "root-port" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "The goods were transported by train.", zh: "货物由火车运输。" }],
    assoc: { story: "trans(从一处到另一处)+port(搬)= 搬运过去 → 运输。作名词时重音在首:/ˈtrænspɔːt/,指「运输;交通工具」。" } },
  { id: "portable", word: "portable", phonetic: "/ˈpɔːtəbl/",
    senses: [{ pos: "adj.", zh: "便携的;手提式的", en: "easy to carry or move" }],
    breakdown: [
      { part: "port", type: "root", zh: "搬运", refId: "root-port" },
      { part: "able", type: "suffix", zh: "可…的", refId: "affix-able" }
    ],
    tags: ["cet6"],
    examples: [{ en: "I bought a small portable speaker.", zh: "我买了一个小巧的便携音箱。" }],
    assoc: { story: "port(搬)+able(可…的)= 可以搬着走的 → 便携的。" } },
  { id: "export", word: "export", phonetic: "/ɪkˈspɔːt/",
    senses: [{ pos: "v.", zh: "出口", en: "to send goods abroad" }],
    breakdown: [
      { part: "ex", type: "prefix", zh: "出", refId: "affix-ex" },
      { part: "port", type: "root", zh: "搬运", refId: "root-port" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The country exports coffee.", zh: "这个国家出口咖啡。" }],
    assoc: { story: "构词:ex(出) + port(搬运) → 出口" } },
  { id: "passport", word: "passport", phonetic: "/ˈpɑːspɔːt/",
    senses: [{ pos: "n.", zh: "护照", en: "a travel document" }],
    breakdown: [
      { part: "pass", type: "none", zh: "通过" },
      { part: "port", type: "root", zh: "搬运", refId: "root-port" }
    ],
    tags: ["cet6"],
    examples: [{ en: "You need a passport to enter the country.", zh: "入境需要护照。" }],
    assoc: { story: "构词:port(搬运) → 护照" } },
  { id: "portfolio", word: "portfolio", phonetic: "/pɔːtˈfəʊliəʊ/",
    senses: [{ pos: "n.", zh: "作品集；公文包", en: "a set of works or papers" }],
    breakdown: [
      { part: "port", type: "root", zh: "搬运", refId: "root-port" },
      { part: "folio", type: "none", zh: "页/张" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The artist showed his portfolio.", zh: "艺术家展示了他的作品集。" }],
    assoc: { story: "构词:port(搬运) → 作品集" } },
  { id: "report", word: "report", phonetic: "/rɪˈpɔːt/",
    senses: [{ pos: "v.", zh: "报告", en: "to give an account of" }],
    breakdown: [
      { part: "re", type: "prefix", zh: "回", refId: "affix-re" },
      { part: "port", type: "root", zh: "搬运", refId: "root-port" }
    ],
    tags: ["cet6"],
    examples: [{ en: "She reported the news to her boss.", zh: "她把消息报告给了老板。" }],
    assoc: { story: "构词:re(回) + port(搬运) → 报告" } },
  { id: "support", word: "support", phonetic: "/səˈpɔːt/",
    senses: [{ pos: "v.", zh: "支持；支撑", en: "to hold up or agree with" }],
    breakdown: [
      { part: "sup", type: "none", zh: "在下" },
      { part: "port", type: "root", zh: "搬运", refId: "root-port" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The pillars support the roof.", zh: "柱子支撑着屋顶。" }],
    assoc: { story: "构词:port(搬运) → 支持" } },
  { id: "deport", word: "deport", phonetic: "/dɪˈpɔːt/",
    senses: [{ pos: "v.", zh: "驱逐", en: "to send a foreigner away" }],
    breakdown: [
      { part: "de", type: "prefix", zh: "离开", refId: "affix-de" },
      { part: "port", type: "root", zh: "搬运", refId: "root-port" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The man was deported for illegal entry.", zh: "那人因非法入境被驱逐。" }],
    assoc: { story: "构词:de(离开) + port(搬运) → 驱逐" } },
];
module.exports = words;
