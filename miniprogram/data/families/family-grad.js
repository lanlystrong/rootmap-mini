const words = [
  { id: "progress", word: "progress", phonetic: "/ˈprəʊɡres/",
    senses: [{ pos: "n.", zh: "进步;进展", en: "the process of improving or moving forward" }],
    breakdown: [
      { part: "pro", type: "prefix", zh: "向前", refId: "affix-pro" },
      { part: "gress", type: "root", zh: "走", refId: "root-grad" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "He has made good progress in his studies.", zh: "他在学业上进步很大。" }],
    assoc: { story: "pro(向前)+gress(走)= 向前走 → 前进、进步。名词读 /ˈprəʊɡres/,动词读 /prəˈɡres/。" } },
  { id: "upgrade", word: "upgrade", phonetic: "/ˌʌpˈɡreɪd/",
    senses: [{ pos: "v.", zh: "使升级;提高", en: "to improve something so that it is better or more modern" }],
    breakdown: [
      { part: "up", type: "prefix", zh: "向上", refId: "affix-up" },
      { part: "grad", type: "root", zh: "级", refId: "root-grad" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "You can upgrade your phone to the latest version.", zh: "你可以把手机升级到最新版本。" }],
    assoc: { story: "up(向上)+grad(级)+e = 往上一级 → 升级。动词读 /ˌʌpˈɡreɪd/,名词多读 /ˈʌpɡreɪd/。" } },
  { id: "grade", word: "grade", phonetic: "/ɡreɪd/",
    senses: [{ pos: "n.", zh: "年级；等级", en: "a level or rank" }],
    breakdown: [
      { part: "grad", type: "root", zh: "步/走", refId: "root-grad" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "She is in the fifth grade.", zh: "她读五年级。" }],
    assoc: { story: "构词:grad(步/走) → 年级" } },
  { id: "gradual", word: "gradual", phonetic: "/ˈɡrædʒuəl/",
    senses: [{ pos: "adj.", zh: "逐渐的", en: "happening slowly" }],
    breakdown: [
      { part: "grad", type: "root", zh: "步/走", refId: "root-grad" },
      { part: "ual", type: "suffix", zh: "…的", refId: "affix-ual" }
    ],
    tags: ["cet6"],
    examples: [{ en: "There was a gradual improvement.", zh: "出现了渐进的改善。" }],
    assoc: { story: "构词:grad(步/走) + ual(…的) → 逐渐的" } },
  { id: "graduate", word: "graduate", phonetic: "/ˈɡrædʒueɪt/",
    senses: [{ pos: "v.", zh: "毕业", en: "to finish a course of study" }],
    breakdown: [
      { part: "grad", type: "root", zh: "步/走", refId: "root-grad" },
      { part: "u", type: "none" },
      { part: "ate", type: "suffix", zh: "使…", refId: "affix-ate" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He graduated from college last year.", zh: "他去年大学毕业。" }],
    assoc: { story: "构词:grad(步/走) + ate(使…) → 毕业" } },
  { id: "aggressive", word: "aggressive", phonetic: "/əˈɡresɪv/",
    senses: [{ pos: "adj.", zh: "好斗的；积极的", en: "ready to attack or act" }],
    breakdown: [
      { part: "ag", type: "none", zh: "朝向" },
      { part: "gress", type: "root", zh: "步/走", refId: "root-grad" },
      { part: "ive", type: "suffix", zh: "…的", refId: "affix-ive" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He took an aggressive approach.", zh: "他采取了咄咄逼人的态度。" }],
    assoc: { story: "构词:gress(步/走) + ive(…的) → 好斗的" } },
  { id: "congress", word: "congress", phonetic: "/ˈkɒŋɡres/",
    senses: [{ pos: "n.", zh: "国会；大会", en: "a formal meeting or parliament" }],
    breakdown: [
      { part: "con", type: "prefix", zh: "共同", refId: "affix-con" },
      { part: "gress", type: "root", zh: "步/走", refId: "root-grad" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The congress debated the bill.", zh: "国会辩论了该项法案。" }],
    assoc: { story: "构词:con(共同) + gress(步/走) → 国会" } },
  { id: "degrade", word: "degrade", phonetic: "/dɪˈɡreɪd/",
    senses: [{ pos: "v.", zh: "降级；退化", en: "to lower in rank" }],
    breakdown: [
      { part: "de", type: "prefix", zh: "离开", refId: "affix-de" },
      { part: "grad", type: "root", zh: "步/走", refId: "root-grad" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The land was degraded by erosion.", zh: "土地因侵蚀而退化。" }],
    assoc: { story: "构词:de(离开) + grad(步/走) → 降级" } },
];
module.exports = words;
