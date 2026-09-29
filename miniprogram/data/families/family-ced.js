const words = [
  { id: "succeed", word: "succeed", phonetic: "/səkˈsiːd/",
    senses: [{ pos: "v.", zh: "成功;做成", en: "to achieve what you have tried to do" }],
    breakdown: [
      { part: "suc", type: "prefix", zh: "紧接着/接近", refId: "affix-sub" },
      { part: "ceed", type: "root", zh: "走", refId: "root-ced" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "If you try hard, you will succeed.", zh: "只要努力,你就会成功。" }],
    assoc: { story: "suc(sub- 紧接着,在 c 前同化)+ceed(走)= 紧随走到目标 → 成功;紧接其后 → 接替。" } },
  { id: "success", word: "success", phonetic: "/səkˈses/",
    senses: [{ pos: "n.", zh: "成功;成就", en: "the fact that you have achieved what you wanted" }],
    breakdown: [
      { part: "suc", type: "prefix", zh: "紧接着/接近", refId: "affix-sub" },
      { part: "cess", type: "root", zh: "走", refId: "root-ced" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "Hard work is the key to success.", zh: "努力是成功的关键。" }],
    assoc: { story: "suc(sub- 紧接着)+cess(走)= 走到底、走出来 → 成功。" } },
  { id: "successful", word: "successful", phonetic: "/səkˈsesfl/",
    senses: [{ pos: "adj.", zh: "成功的;有成效的", en: "achieving what you wanted to achieve" }],
    breakdown: [
      { part: "suc", type: "prefix", zh: "紧接着/接近", refId: "affix-sub" },
      { part: "cess", type: "root", zh: "走", refId: "root-ced" },
      { part: "ful", type: "suffix", zh: "充满…的", refId: "affix-ful" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "She is a successful businesswoman.", zh: "她是一位成功的女商人。" }],
    assoc: { story: "suc+cess(走)+ful(充满)= 如愿走到终点 → 成功的。" } },
  { id: "process", word: "process", phonetic: "/ˈprəʊses/",
    senses: [{ pos: "n.", zh: "过程;进程", en: "a series of actions or steps that produce a result" }],
    breakdown: [
      { part: "pro", type: "prefix", zh: "向前", refId: "affix-pro" },
      { part: "cess", type: "root", zh: "走", refId: "root-ced" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "Learning a language is a slow process.", zh: "学一门语言是一个缓慢的过程。" }],
    assoc: { story: "pro(向前)+cess(走)= 一步步向前走的过程 → 过程、工序;动词「处理」。" } },
  { id: "proceed", word: "proceed", phonetic: "/prəˈsiːd/",
    senses: [{ pos: "v.", zh: "继续进行", en: "to continue" }],
    breakdown: [
      { part: "pro", type: "prefix", zh: "向前", refId: "affix-pro" },
      { part: "ceed", type: "root", zh: "行走/让步", refId: "root-ced" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Please proceed with the plan.", zh: "请继续执行计划。" }],
    assoc: { story: "构词:pro(向前) + ceed(行走/让步) → 继续进行" } },
  { id: "exceed", word: "exceed", phonetic: "/ɪkˈsiːd/",
    senses: [{ pos: "v.", zh: "超过", en: "to go beyond" }],
    breakdown: [
      { part: "ex", type: "prefix", zh: "出", refId: "affix-ex" },
      { part: "ceed", type: "root", zh: "行走/让步", refId: "root-ced" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The cost exceeded our budget.", zh: "费用超出了预算。" }],
    assoc: { story: "构词:ex(出) + ceed(行走/让步) → 超过" } },
  { id: "precede", word: "precede", phonetic: "/prɪˈsiːd/",
    senses: [{ pos: "v.", zh: "在…之前", en: "to come before" }],
    breakdown: [
      { part: "pre", type: "prefix", zh: "先", refId: "affix-pre" },
      { part: "ced", type: "root", zh: "行走/让步", refId: "root-ced" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "A preface precedes the text.", zh: "序言在正文之前。" }],
    assoc: { story: "构词:pre(先) + ced(行走/让步) → 在…之前" } },
  { id: "access", word: "access", phonetic: "/ˈækses/",
    senses: [{ pos: "n.", zh: "进入；使用权", en: "a way to reach" }],
    breakdown: [
      { part: "ac", type: "prefix", zh: "去", refId: "affix-ad" },
      { part: "cess", type: "root", zh: "行走/让步", refId: "root-ced" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The building has easy access.", zh: "这栋楼进出方便。" }],
    assoc: { story: "构词:ac(去) + cess(行走/让步) → 进入" } },
  { id: "necessary", word: "necessary", phonetic: "/ˈnesəsəri/",
    senses: [{ pos: "adj.", zh: "必要的", en: "needed" }],
    breakdown: [
      { part: "ne", type: "none", zh: "不" },
      { part: "cess", type: "root", zh: "行走/让步", refId: "root-ced" },
      { part: "ary", type: "suffix", zh: "…的", refId: "affix-ary" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Sleep is necessary for health.", zh: "睡眠对健康是必要的。" }],
    assoc: { story: "构词:cess(行走/让步) + ary(…的) → 必要的" } },
  { id: "concession", word: "concession", phonetic: "/kənˈseʃn/",
    senses: [{ pos: "n.", zh: "让步", en: "something given up" }],
    breakdown: [
      { part: "con", type: "prefix", zh: "共同", refId: "affix-con" },
      { part: "cess", type: "root", zh: "行走/让步", refId: "root-ced" },
      { part: "ion", type: "suffix", zh: "…的状态", refId: "affix-ion" }
    ],
    tags: ["cet6"],
    examples: [{ en: "They won a small concession.", zh: "他们赢得了一点让步。" }],
    assoc: { story: "构词:con(共同) + cess(行走/让步) + ion(…的状态) → 让步" } },
];
module.exports = words;
