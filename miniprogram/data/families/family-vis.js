const words = [
  { id: "advise", word: "advise", phonetic: "/ədˈvaɪz/",
    senses: [{ pos: "v.", zh: "建议;劝告", en: "to tell someone what you think they should do" }],
    breakdown: [
      { part: "ad", type: "prefix", zh: "朝向", refId: "affix-ad" },
      { part: "vis", type: "root", zh: "看", refId: "root-vis" },
      { part: "e", type: "none" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "The doctor advised me to rest more.", zh: "医生建议我多休息。" }],
    assoc: { story: "ad(朝向)+vis(看)+e = 让对方看到(该怎么做)→ 建议。注意名词拼作 advice。" } },
  { id: "evidence", word: "evidence", phonetic: "/ˈevɪdəns/",
    senses: [{ pos: "n.", zh: "证据;证明", en: "facts or signs that make you believe something is true" }],
    breakdown: [
      { part: "e", type: "prefix", zh: "出", refId: "affix-e" },
      { part: "vid", type: "root", zh: "看", refId: "root-vis" },
      { part: "ence", type: "suffix", zh: "名词后缀", refId: "affix-ence" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "The police found no evidence of a crime.", zh: "警方没有发现犯罪证据。" }],
    assoc: { story: "e(出)+vid(看)+ence = 让人看得出来的事实 → 证据。" } },
  { id: "vision", word: "vision", phonetic: "/ˈvɪʒn/",
    senses: [{ pos: "n.", zh: "视力；视野", en: "the ability to see" }],
    breakdown: [
      { part: "vis", type: "root", zh: "看", refId: "root-vis" },
      { part: "ion", type: "suffix", zh: "…的状态", refId: "affix-ion" }
    ],
    tags: ["cet6"],
    examples: [{ en: "She has poor vision in her left eye.", zh: "她左眼视力不好。" }],
    assoc: { story: "构词:vis(看) + ion(…的状态) → 视力" } },
  { id: "visible", word: "visible", phonetic: "/ˈvɪzəbl/",
    senses: [{ pos: "adj.", zh: "可见的", en: "able to be seen" }],
    breakdown: [
      { part: "vis", type: "root", zh: "看", refId: "root-vis" },
      { part: "ible", type: "suffix", zh: "可…的", refId: "affix-ible" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The stars were visible in the night sky.", zh: "夜空中星星清晰可见。" }],
    assoc: { story: "构词:vis(看) + ible(可…的) → 可见的" } },
  { id: "visual", word: "visual", phonetic: "/ˈvɪʒuəl/",
    senses: [{ pos: "adj.", zh: "视觉的", en: "relating to sight" }],
    breakdown: [
      { part: "vis", type: "root", zh: "看", refId: "root-vis" },
      { part: "ual", type: "suffix", zh: "…的", refId: "affix-ual" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The book has strong visual appeal.", zh: "这本书视觉上很有吸引力。" }],
    assoc: { story: "构词:vis(看) + ual(…的) → 视觉的" } },
  { id: "visit", word: "visit", phonetic: "/ˈvɪzɪt/",
    senses: [{ pos: "v.", zh: "访问；探望", en: "to go to see a person or place" }],
    breakdown: [
      { part: "vis", type: "root", zh: "看", refId: "root-vis" },
      { part: "it", type: "none", zh: "走" }
    ],
    tags: ["cet6"],
    examples: [{ en: "We will visit our grandparents this weekend.", zh: "这周末我们要去看望祖父母。" }],
    assoc: { story: "构词:vis(看) → 访问" } },
  { id: "revise", word: "revise", phonetic: "/rɪˈvaɪz/",
    senses: [{ pos: "v.", zh: "修订；复习", en: "to look at again and change" }],
    breakdown: [
      { part: "re", type: "prefix", zh: "再", refId: "affix-re" },
      { part: "vis", type: "root", zh: "看", refId: "root-vis" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "She revised the essay before handing it in.", zh: "她交稿前修改了文章。" }],
    assoc: { story: "构词:re(再) + vis(看) → 修订" } },
  { id: "provide", word: "provide", phonetic: "/prəˈvaɪd/",
    senses: [{ pos: "v.", zh: "提供；供应", en: "to give what is needed" }],
    breakdown: [
      { part: "pro", type: "prefix", zh: "向前", refId: "affix-pro" },
      { part: "vid", type: "root", zh: "看", refId: "root-vis" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The school provides lunch for students.", zh: "学校为学生提供午餐。" }],
    assoc: { story: "构词:pro(向前) + vid(看) → 提供" } },
];
module.exports = words;
