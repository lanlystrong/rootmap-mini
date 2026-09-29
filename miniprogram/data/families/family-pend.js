const words = [
  { id: "depend", word: "depend", phonetic: "/dɪˈpend/",
    senses: [{ pos: "v.", zh: "依靠;依赖", en: "to need someone or something for support, help or money" }],
    breakdown: [
      { part: "de", type: "prefix", zh: "向下", refId: "affix-de" },
      { part: "pend", type: "root", zh: "悬挂", refId: "root-pend" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "Children depend on their parents.", zh: "孩子依靠父母。" }],
    assoc: { story: "de(向下)+pend(悬挂)= 挂在…下面 → 依靠、取决于。" } },
  { id: "dependent", word: "dependent", phonetic: "/dɪˈpendənt/",
    senses: [{ pos: "adj.", zh: "依赖的;依靠的", en: "needing someone or something for support" }],
    breakdown: [
      { part: "de", type: "prefix", zh: "向下", refId: "affix-de" },
      { part: "pend", type: "root", zh: "悬挂", refId: "root-pend" },
      { part: "ent", type: "suffix", zh: "…的", refId: "affix-ent" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Small children are dependent on their mothers.", zh: "小孩依赖母亲。" }],
    assoc: { story: "de(向下)+pend(挂)+ent(…的)= 挂靠在他人身上的 → 依赖的。" } },
  { id: "expense", word: "expense", phonetic: "/ɪkˈspens/",
    senses: [{ pos: "n.", zh: "费用;开销", en: "the money that you spend on something" }],
    breakdown: [
      { part: "ex", type: "prefix", zh: "向外", refId: "affix-ex" },
      { part: "pens", type: "root", zh: "称量/付", refId: "root-pend" },
      { part: "e", type: "none" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "Living expenses are high in big cities.", zh: "大城市的生活费用很高。" }],
    assoc: { story: "ex(出)+pens(称量支付)+e = 称量付出去的钱 → 花费、开支。" } },
  { id: "expensive", word: "expensive", phonetic: "/ɪkˈspensɪv/",
    senses: [{ pos: "adj.", zh: "昂贵的;花钱多的", en: "costing a lot of money" }],
    breakdown: [
      { part: "ex", type: "prefix", zh: "向外", refId: "affix-ex" },
      { part: "pens", type: "root", zh: "称量/付", refId: "root-pend" },
      { part: "ive", type: "suffix", zh: "…的", refId: "affix-ive" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "The car is too expensive for me.", zh: "这辆车对我来说太贵了。" }],
    assoc: { story: "ex(出)+pens(付)+ive = 要付出很多钱的 → 昂贵的。" } },
  { id: "suspend", word: "suspend", phonetic: "/səˈspend/",
    senses: [{ pos: "v.", zh: "悬挂；暂停", en: "to hang or pause" }],
    breakdown: [
      { part: "sus", type: "none", zh: "在下" },
      { part: "pend", type: "root", zh: "悬挂/付", refId: "root-pend" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The bridge is suspended by cables.", zh: "桥由钢缆悬挂。" }],
    assoc: { story: "构词:pend(悬挂/付) → 悬挂" } },
  { id: "expend", word: "expend", phonetic: "/ɪkˈspend/",
    senses: [{ pos: "v.", zh: "花费", en: "to spend" }],
    breakdown: [
      { part: "ex", type: "prefix", zh: "出", refId: "affix-ex" },
      { part: "pend", type: "root", zh: "悬挂/付", refId: "root-pend" }
    ],
    tags: ["cet6"],
    examples: [{ en: "They expended much effort.", zh: "他们付出了很多努力。" }],
    assoc: { story: "构词:ex(出) + pend(悬挂/付) → 花费" } },
  { id: "pension", word: "pension", phonetic: "/ˈpenʃn/",
    senses: [{ pos: "n.", zh: "养老金", en: "retirement pay" }],
    breakdown: [
      { part: "pens", type: "root", zh: "悬挂/付", refId: "root-pend" },
      { part: "ion", type: "suffix", zh: "…的状态", refId: "affix-ion" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He lives on a small pension.", zh: "他靠微薄的养老金生活。" }],
    assoc: { story: "构词:pens(悬挂/付) + ion(…的状态) → 养老金" } },
  { id: "compensate", word: "compensate", phonetic: "/ˈkɒmpenseɪt/",
    senses: [{ pos: "v.", zh: "补偿", en: "to make up for" }],
    breakdown: [
      { part: "com", type: "prefix", zh: "共同", refId: "affix-com" },
      { part: "pens", type: "root", zh: "悬挂/付", refId: "root-pend" },
      { part: "ate", type: "suffix", zh: "使…", refId: "affix-ate" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The company compensated the loss.", zh: "公司赔偿了损失。" }],
    assoc: { story: "构词:com(共同) + pens(悬挂/付) + ate(使…) → 补偿" } },
  { id: "independent", word: "independent", phonetic: "/ˌɪndɪˈpendənt/",
    senses: [{ pos: "adj.", zh: "独立的", en: "not controlled by others" }],
    breakdown: [
      { part: "in", type: "prefix", zh: "不", refId: "affix-in" },
      { part: "de", type: "prefix", zh: "离开", refId: "affix-de" },
      { part: "pend", type: "root", zh: "悬挂/付", refId: "root-pend" },
      { part: "ent", type: "suffix", zh: "…的", refId: "affix-ent" }
    ],
    tags: ["cet6"],
    examples: [{ en: "She is financially independent.", zh: "她在经济上独立。" }],
    assoc: { story: "构词:in(不) + de(离开) + pend(悬挂/付) + ent(…的) → 独立的" } },
];
module.exports = words;
