const words = [
  { id: "pressure", word: "pressure", phonetic: "/ˈpreʃə/",
    senses: [{ pos: "n.", zh: "压力;压强", en: "the force produced when something presses on a surface" }],
    breakdown: [
      { part: "press", type: "root", zh: "压", refId: "root-press" },
      { part: "ure", type: "suffix", zh: "名词后缀", refId: "affix-ure" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "The pressure of the water can damage the pipe.", zh: "水压会损坏管道。" }],
    assoc: { story: "press(压)+ure = 被压的状态 → 压力。" } },
  { id: "express", word: "express", phonetic: "/ɪkˈspres/",
    senses: [{ pos: "v.", zh: "表达;表露", en: "to show or tell what you think or feel" }],
    breakdown: [
      { part: "ex", type: "prefix", zh: "向外", refId: "affix-ex" },
      { part: "press", type: "root", zh: "压", refId: "root-press" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "She expressed her thanks to everyone.", zh: "她向大家表达了感谢。" }],
    assoc: { story: "ex(出)+press(压)= 把心里话压出来 → 表达。" } },
  { id: "compress", word: "compress", phonetic: "/kəmˈpres/",
    senses: [{ pos: "v.", zh: "压缩", en: "to squeeze into less space" }],
    breakdown: [
      { part: "com", type: "prefix", zh: "共同", refId: "affix-com" },
      { part: "press", type: "root", zh: "压", refId: "root-press" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Compress the file before sending.", zh: "发送前压缩文件。" }],
    assoc: { story: "构词:com(共同) + press(压) → 压缩" } },
  { id: "depress", word: "depress", phonetic: "/dɪˈpres/",
    senses: [{ pos: "v.", zh: "使沮丧；压下", en: "to make sad or push down" }],
    breakdown: [
      { part: "de", type: "prefix", zh: "离开", refId: "affix-de" },
      { part: "press", type: "root", zh: "压", refId: "root-press" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Rainy days depress her mood.", zh: "雨天让她情绪低落。" }],
    assoc: { story: "构词:de(离开) + press(压) → 使沮丧" } },
  { id: "impress", word: "impress", phonetic: "/ɪmˈpres/",
    senses: [{ pos: "v.", zh: "给…留下印象", en: "to affect deeply" }],
    breakdown: [
      { part: "im", type: "prefix", zh: "入", refId: "affix-im" },
      { part: "press", type: "root", zh: "压", refId: "root-press" }
    ],
    tags: ["cet6"],
    examples: [{ en: "His speech impressed the audience.", zh: "他的演讲打动了听众。" }],
    assoc: { story: "构词:im(入) + press(压) → 给…留下印象" } },
  { id: "suppress", word: "suppress", phonetic: "/səˈpres/",
    senses: [{ pos: "v.", zh: "镇压；抑制", en: "to hold back by force" }],
    breakdown: [
      { part: "sup", type: "none", zh: "在下" },
      { part: "press", type: "root", zh: "压", refId: "root-press" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The urge was suppressed.", zh: "那股冲动被压了下去。" }],
    assoc: { story: "构词:press(压) → 镇压" } },
  { id: "oppress", word: "oppress", phonetic: "/əˈpres/",
    senses: [{ pos: "v.", zh: "压迫", en: "to rule cruelly" }],
    breakdown: [
      { part: "op", type: "none", zh: "相反" },
      { part: "press", type: "root", zh: "压", refId: "root-press" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The tyrant oppressed the people.", zh: "暴君压迫人民。" }],
    assoc: { story: "构词:press(压) → 压迫" } },
];
module.exports = words;
