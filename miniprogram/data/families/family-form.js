const words = [
  { id: "uniform", word: "uniform", phonetic: "/ˈjuːnɪfɔːm/",
    senses: [{ pos: "n.", zh: "制服;校服", en: "special clothes worn by all members of a group or organization" }],
    breakdown: [
      { part: "uni", type: "prefix", zh: "单一", refId: "affix-uni" },
      { part: "form", type: "root", zh: "形状/形成", refId: "root-form" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "All the students wear a school uniform.", zh: "所有学生都穿校服。" }],
    assoc: { story: "uni(一)+form(形状)= 同一种形状 → 制服;统一的。" } },
  { id: "formal", word: "formal", phonetic: "/ˈfɔːml/",
    senses: [{ pos: "adj.", zh: "正式的;正规的", en: "following official rules and accepted ways of doing things" }],
    breakdown: [
      { part: "form", type: "root", zh: "形状/形式", refId: "root-form" },
      { part: "al", type: "suffix", zh: "…的", refId: "affix-al" }
    ],
    tags: ["cet6"],
    examples: [{ en: "We sent a formal letter to the manager.", zh: "我们给经理发了一封正式函件。" }],
    assoc: { story: "form(形式)+al = 讲究形式、按规矩来 → 正式的。" } },
  { id: "informal", word: "informal", phonetic: "/ɪnˈfɔːml/",
    senses: [{ pos: "adj.", zh: "非正式的;随意的", en: "relaxed and friendly, not following strict rules or forms" }],
    breakdown: [
      { part: "in", type: "prefix", zh: "不/非", refId: "affix-in-neg" },
      { part: "form", type: "root", zh: "形状/形式", refId: "root-form" },
      { part: "al", type: "suffix", zh: "…的", refId: "affix-al" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Use informal English when you talk to friends.", zh: "和朋友交谈时使用非正式英语。" }],
    assoc: { story: "in(不)+formal(正式)= 不讲究形式 → 非正式的。" } },
  { id: "transform", word: "transform", phonetic: "/trænsˈfɔːm/",
    senses: [{ pos: "v.", zh: "使改观;使转化", en: "to change something completely, usually improving it" }],
    breakdown: [
      { part: "trans", type: "prefix", zh: "转移/变化", refId: "affix-trans" },
      { part: "form", type: "root", zh: "形状", refId: "root-form" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "Computers have transformed the way we work.", zh: "电脑改变了我们的工作方式。" }],
    assoc: { story: "trans(转变)+form(形状)= 改变形态 → 使改观、改造。" } },
  { id: "inform", word: "inform", phonetic: "/ɪnˈfɔːm/",
    senses: [{ pos: "v.", zh: "通知", en: "to tell someone of" }],
    breakdown: [
      { part: "in", type: "prefix", zh: "入", refId: "affix-in" },
      { part: "form", type: "root", zh: "形状/形成", refId: "root-form" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Please inform me of any change.", zh: "如有变动请通知我。" }],
    assoc: { story: "构词:in(入) + form(形状/形成) → 通知" } },
  { id: "reform", word: "reform", phonetic: "/rɪˈfɔːm/",
    senses: [{ pos: "v.", zh: "改革", en: "to improve by changing" }],
    breakdown: [
      { part: "re", type: "prefix", zh: "再", refId: "affix-re" },
      { part: "form", type: "root", zh: "形状/形成", refId: "root-form" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The law aims to reform education.", zh: "该法律旨在改革教育。" }],
    assoc: { story: "构词:re(再) + form(形状/形成) → 改革" } },
  { id: "conform", word: "conform", phonetic: "/kənˈfɔːm/",
    senses: [{ pos: "v.", zh: "符合；遵守", en: "to obey rules" }],
    breakdown: [
      { part: "con", type: "prefix", zh: "共同", refId: "affix-con" },
      { part: "form", type: "root", zh: "形状/形成", refId: "root-form" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Students must conform to the dress code.", zh: "学生必须遵守着装规定。" }],
    assoc: { story: "构词:con(共同) + form(形状/形成) → 符合" } },
  { id: "perform", word: "perform", phonetic: "/pəˈfɔːm/",
    senses: [{ pos: "v.", zh: "表演；执行", en: "to do or act" }],
    breakdown: [
      { part: "per", type: "prefix", zh: "通过", refId: "affix-per" },
      { part: "form", type: "root", zh: "形状/形成", refId: "root-form" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The band performed a new song.", zh: "乐队表演了一首新歌。" }],
    assoc: { story: "构词:per(通过) + form(形状/形成) → 表演" } },
  { id: "formula", word: "formula", phonetic: "/ˈfɔːmjələ/",
    senses: [{ pos: "n.", zh: "公式", en: "a set rule or equation" }],
    breakdown: [
      { part: "form", type: "root", zh: "形状/形成", refId: "root-form" },
      { part: "ula", type: "none", zh: "小" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The formula calculates the area.", zh: "这个公式用来计算面积。" }],
    assoc: { story: "构词:form(形状/形成) → 公式" } },
  { id: "formation", word: "formation", phonetic: "/fɔːˈmeɪʃn/",
    senses: [{ pos: "n.", zh: "形成；编队", en: "the act of forming" }],
    breakdown: [
      { part: "form", type: "root", zh: "形状/形成", refId: "root-form" },
      { part: "ation", type: "suffix", zh: "…的行为", refId: "affix-ation" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Cloud formation is fascinating.", zh: "云的形成很奇妙。" }],
    assoc: { story: "构词:form(形状/形成) + ation(…的行为) → 形成" } },
];
module.exports = words;
