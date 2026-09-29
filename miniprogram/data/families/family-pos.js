const words = [
  { id: "suppose", word: "suppose", phonetic: "/səˈpəʊz/",
    senses: [{ pos: "v.", zh: "认为;猜想", en: "to think that something is probably true" }],
    breakdown: [
      { part: "sup", type: "prefix", zh: "自下/私下", refId: "affix-sub" },
      { part: "pos", type: "root", zh: "放置", refId: "root-pos" },
      { part: "e", type: "none" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "I suppose he is telling the truth.", zh: "我想他说的是实话。" }],
    assoc: { story: "sup(sub- 私下)+pos(放)+e = 把(想法)放在心底 → 猜想、料想。" } },
  { id: "compose", word: "compose", phonetic: "/kəmˈpəʊz/",
    senses: [{ pos: "v.", zh: "组成;构成", en: "to be formed from a number of things" }],
    breakdown: [
      { part: "com", type: "prefix", zh: "共同/聚拢", refId: "affix-com" },
      { part: "pos", type: "root", zh: "放", refId: "root-pos" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Water is composed of hydrogen and oxygen.", zh: "水由氢和氧组成。" }],
    assoc: { story: "com(聚拢)+pos(放)+e = 把各部分放到一起 → 组成、创作。" } },
  { id: "positive", word: "positive", phonetic: "/ˈpɒzətɪv/",
    senses: [{ pos: "adj.", zh: "积极的;乐观的", en: "hopeful and confident" }],
    breakdown: [
      { part: "pos", type: "root", zh: "放", refId: "root-pos" },
      { part: "it", type: "none" },
      { part: "ive", type: "suffix", zh: "…的", refId: "affix-ive" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "Try to stay positive about the future.", zh: "尽量对未来保持乐观。" }],
    assoc: { story: "pos(放)+it+ive = 把心态放在好的一面 → 积极的、肯定的。" } },
  { id: "postpone", word: "postpone", phonetic: "/pəˈspəʊn/",
    senses: [{ pos: "v.", zh: "推迟;延期", en: "to delay something to a later time or date" }],
    breakdown: [
      { part: "post", type: "prefix", zh: "在…之后", refId: "affix-post" },
      { part: "pon", type: "root", zh: "放", refId: "root-pos" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The meeting was postponed until next week.", zh: "会议被推迟到下周。" }],
    assoc: { story: "post(在…之后)+pon(放)+e = 放到后面 → 推迟。" } },
  { id: "component", word: "component", phonetic: "/kəmˈpəʊnənt/",
    senses: [{ pos: "n.", zh: "组成部分;部件;元件", en: "one of the parts that make up a machine or system" }],
    breakdown: [
      { part: "com", type: "prefix", zh: "共同", refId: "affix-com" },
      { part: "pon", type: "root", zh: "放", refId: "root-pos" },
      { part: "ent", type: "suffix", zh: "…者(名词)", refId: "affix-ent" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Each component of the system is tested separately.", zh: "系统的每个部件都单独测试。" }],
    assoc: { story: "com(共同)+pon(放)+ent = 放到一起构成整体的部分 → 部件、组成部分。" } },
  { id: "oppose", word: "oppose", phonetic: "/əˈpəʊz/",
    senses: [{ pos: "v.", zh: "反对", en: "to be against" }],
    breakdown: [
      { part: "op", type: "none", zh: "相反" },
      { part: "pos", type: "root", zh: "放置", refId: "root-pos" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Many opposed the new law.", zh: "许多人反对新法。" }],
    assoc: { story: "构词:pos(放置) → 反对" } },
  { id: "propose", word: "propose", phonetic: "/prəˈpəʊz/",
    senses: [{ pos: "v.", zh: "提议", en: "to suggest" }],
    breakdown: [
      { part: "pro", type: "prefix", zh: "向前", refId: "affix-pro" },
      { part: "pos", type: "root", zh: "放置", refId: "root-pos" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He proposed a new idea.", zh: "他提出了一个新想法。" }],
    assoc: { story: "构词:pro(向前) + pos(放置) → 提议" } },
  { id: "expose", word: "expose", phonetic: "/ɪkˈspəʊz/",
    senses: [{ pos: "v.", zh: "暴露", en: "to uncover" }],
    breakdown: [
      { part: "ex", type: "prefix", zh: "出", refId: "affix-ex" },
      { part: "pos", type: "root", zh: "放置", refId: "root-pos" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The report exposed the scandal.", zh: "报道揭露了丑闻。" }],
    assoc: { story: "构词:ex(出) + pos(放置) → 暴露" } },
  { id: "dispose", word: "dispose", phonetic: "/dɪˈspəʊz/",
    senses: [{ pos: "v.", zh: "处理；处置", en: "to get rid of" }],
    breakdown: [
      { part: "dis", type: "prefix", zh: "分开", refId: "affix-dis" },
      { part: "pos", type: "root", zh: "放置", refId: "root-pos" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Dispose of the waste properly.", zh: "妥善处理废弃物。" }],
    assoc: { story: "构词:dis(分开) + pos(放置) → 处理" } },
  { id: "deposit", word: "deposit", phonetic: "/dɪˈpɒzɪt/",
    senses: [{ pos: "v.", zh: "存放；沉积", en: "to put down or store" }],
    breakdown: [
      { part: "de", type: "prefix", zh: "离开", refId: "affix-de" },
      { part: "pos", type: "root", zh: "放置", refId: "root-pos" },
      { part: "it", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "She deposited money in the bank.", zh: "她把钱存入银行。" }],
    assoc: { story: "构词:de(离开) + pos(放置) → 存放" } },
  { id: "position", word: "position", phonetic: "/pəˈzɪʃn/",
    senses: [{ pos: "n.", zh: "位置；职位", en: "a place or job" }],
    breakdown: [
      { part: "pos", type: "root", zh: "放置", refId: "root-pos" },
      { part: "ition", type: "none", zh: "…的状态" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He applied for a new position.", zh: "他申请了一个新职位。" }],
    assoc: { story: "构词:pos(放置) → 位置" } },
];
module.exports = words;
