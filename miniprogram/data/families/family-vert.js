const words = [
  { id: "version", word: "version", phonetic: "/ˈvɜːʃn/",
    senses: [{ pos: "n.", zh: "版本", en: "a form of something that is slightly different from others" }],
    breakdown: [
      { part: "vers", type: "root", zh: "转", refId: "root-vert" },
      { part: "ion", type: "suffix", zh: "名词后缀", refId: "affix-ion" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "This is the latest version of the app.", zh: "这是该应用的最新版本。" }],
    assoc: { story: "vers(转)+ion = 转述出来的样式 → 版本、说法。" } },
  { id: "advertise", word: "advertise", phonetic: "/ˈædvətaɪz/",
    senses: [{ pos: "v.", zh: "为…做广告;宣传", en: "to tell people about a product or service to make them buy it" }],
    breakdown: [
      { part: "ad", type: "prefix", zh: "朝向", refId: "affix-ad" },
      { part: "vert", type: "root", zh: "转", refId: "root-vert" },
      { part: "ise", type: "suffix", zh: "动词后缀", refId: "affix-ise" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "The company advertises its products on TV.", zh: "该公司在电视上为其产品做广告。" }],
    assoc: { story: "ad(朝向)+vert(转)+ise = 把人们注意转到商品上 → 做广告。" } },
  { id: "convert", word: "convert", phonetic: "/kənˈvɜːt/",
    senses: [{ pos: "v.", zh: "转变；改造", en: "to change form" }],
    breakdown: [
      { part: "con", type: "prefix", zh: "共同", refId: "affix-con" },
      { part: "vert", type: "root", zh: "转", refId: "root-vert" }
    ],
    tags: ["cet6"],
    examples: [{ en: "They converted the attic into a study.", zh: "他们把阁楼改成了书房。" }],
    assoc: { story: "构词:con(共同) + vert(转) → 转变" } },
  { id: "reverse", word: "reverse", phonetic: "/rɪˈvɜːs/",
    senses: [{ pos: "v.", zh: "反转", en: "to turn the other way" }],
    breakdown: [
      { part: "re", type: "prefix", zh: "回", refId: "affix-re" },
      { part: "vers", type: "root", zh: "转", refId: "root-vert" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He reversed the car into the lane.", zh: "他把车倒入车道。" }],
    assoc: { story: "构词:re(回) + vers(转) → 反转" } },
  { id: "diverse", word: "diverse", phonetic: "/daɪˈvɜːs/",
    senses: [{ pos: "adj.", zh: "多样的", en: "showing variety" }],
    breakdown: [
      { part: "di", type: "prefix", zh: "分开", refId: "affix-di" },
      { part: "vers", type: "root", zh: "转", refId: "root-vert" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The city has a diverse culture.", zh: "这座城市文化多元。" }],
    assoc: { story: "构词:di(分开) + vers(转) → 多样的" } },
  { id: "universe", word: "universe", phonetic: "/ˈjuːnɪvɜːs/",
    senses: [{ pos: "n.", zh: "宇宙", en: "all of space and time" }],
    breakdown: [
      { part: "uni", type: "prefix", zh: "一", refId: "affix-uni" },
      { part: "vers", type: "root", zh: "转", refId: "root-vert" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The universe is vast and old.", zh: "宇宙浩瀚而古老。" }],
    assoc: { story: "构词:uni(一) + vers(转) → 宇宙" } },
  { id: "invert", word: "invert", phonetic: "/ɪnˈvɜːt/",
    senses: [{ pos: "v.", zh: "倒置", en: "to turn upside down" }],
    breakdown: [
      { part: "in", type: "prefix", zh: "入", refId: "affix-in" },
      { part: "vert", type: "root", zh: "转", refId: "root-vert" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Invert the bottle to drain it.", zh: "把瓶子倒过来控干。" }],
    assoc: { story: "构词:in(入) + vert(转) → 倒置" } },
  { id: "adverse", word: "adverse", phonetic: "/ˈædvɜːs/",
    senses: [{ pos: "adj.", zh: "不利的", en: "harmful or unfavorable" }],
    breakdown: [
      { part: "ad", type: "prefix", zh: "去", refId: "affix-ad" },
      { part: "vers", type: "root", zh: "转", refId: "root-vert" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The weather had an adverse effect.", zh: "天气造成了不利影响。" }],
    assoc: { story: "构词:ad(去) + vers(转) → 不利的" } },
  { id: "conversation", word: "conversation", phonetic: "/ˌkɒnvəˈseɪʃn/",
    senses: [{ pos: "n.", zh: "对话", en: "an informal talk" }],
    breakdown: [
      { part: "con", type: "prefix", zh: "共同", refId: "affix-con" },
      { part: "vers", type: "root", zh: "转", refId: "root-vert" },
      { part: "ation", type: "suffix", zh: "…的行为", refId: "affix-ation" }
    ],
    tags: ["cet6"],
    examples: [{ en: "They had a long conversation.", zh: "他们进行了一次长谈。" }],
    assoc: { story: "构词:con(共同) + vers(转) + ation(…的行为) → 对话" } },
];
module.exports = words;
