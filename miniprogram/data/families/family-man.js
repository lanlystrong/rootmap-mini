const words = [
  { id: "manual", word: "manual", phonetic: "/ˈmænjuəl/",
    senses: [{ pos: "adj.", zh: "手工的;体力的", en: "done by hand or using physical strength" }],
    breakdown: [
      { part: "manu", type: "root", zh: "手", refId: "root-man" },
      { part: "al", type: "suffix", zh: "…的", refId: "affix-al" }
    ],
    tags: ["cet4"],
    examples: [{ en: "Read the manual before using the machine.", zh: "使用这台机器前请先读说明书。" }],
    assoc: { story: "manu(手)+al = 用手做的 → 手工的;手册(供手边随时翻看)。" } },
  { id: "management", word: "management", phonetic: "/ˈmænɪdʒmənt/",
    senses: [{ pos: "n.", zh: "经营;管理", en: "the control and running of a business or organization" }],
    breakdown: [
      { part: "man", type: "root", zh: "手", refId: "root-man" },
      { part: "age", type: "none" },
      { part: "ment", type: "suffix", zh: "名词后缀", refId: "affix-ment" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "The company needs better management.", zh: "这家公司需要更好的管理。" }],
    assoc: { story: "manage(管理)+ment = 管理的行为或人员 → 经营、管理层。" } },
  { id: "manufacture", word: "manufacture", phonetic: "/ˌmænjuˈfæktʃə/",
    senses: [{ pos: "v.", zh: "制造;(大量)生产", en: "to make goods in large quantities using machines" }],
    breakdown: [
      { part: "manu", type: "root", zh: "手", refId: "root-man" },
      { part: "fact", type: "none" },
      { part: "ure", type: "suffix", zh: "名词后缀", refId: "affix-ure" }
    ],
    tags: ["cet4"],
    examples: [{ en: "This factory manufactures car parts.", zh: "这家工厂制造汽车零件。" }],
    assoc: { story: "manu(手)+fact(做,源自拉丁语 facere)+ure = 最初「用手做」→ 制造。" } },
  { id: "manage", word: "manage", phonetic: "/ˈmænɪdʒ/",
    senses: [{ pos: "v.", zh: "管理", en: "to control or run" }],
    breakdown: [
      { part: "man", type: "root", zh: "手", refId: "root-man" },
      { part: "age", type: "none", zh: "…的行为" }
    ],
    tags: ["cet6"],
    examples: [{ en: "She manages a small team.", zh: "她管理一个小团队。" }],
    assoc: { story: "构词:man(手) → 管理" } },
  { id: "manner", word: "manner", phonetic: "/ˈmænə/",
    senses: [{ pos: "n.", zh: "方式；举止", en: "a way of doing" }],
    breakdown: [
      { part: "man", type: "root", zh: "手", refId: "root-man" },
      { part: "ner", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He spoke in a polite manner.", zh: "他说话彬彬有礼。" }],
    assoc: { story: "构词:man(手) → 方式" } },
  { id: "manifest", word: "manifest", phonetic: "/ˈmænɪfest/",
    senses: [{ pos: "adj.", zh: "明显的", en: "clear to see" }],
    breakdown: [
      { part: "man", type: "root", zh: "手", refId: "root-man" },
      { part: "i", type: "none" },
      { part: "fest", type: "none", zh: "节日" }
    ],
    tags: ["cet6"],
    examples: [{ en: "His joy was manifest.", zh: "他的喜悦显而易见。" }],
    assoc: { story: "构词:man(手) → 明显的" } },
  { id: "manipulate", word: "manipulate", phonetic: "/məˈnɪpjuleɪt/",
    senses: [{ pos: "v.", zh: "操纵；操作", en: "to handle skillfully" }],
    breakdown: [
      { part: "man", type: "root", zh: "手", refId: "root-man" },
      { part: "i", type: "none" },
      { part: "pul", type: "none", zh: "推动" },
      { part: "ate", type: "suffix", zh: "使…", refId: "affix-ate" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He manipulated the data.", zh: "他篡改了数据。" }],
    assoc: { story: "构词:man(手) + ate(使…) → 操纵" } },
  { id: "emancipate", word: "emancipate", phonetic: "/ɪˈmænsɪpeɪt/",
    senses: [{ pos: "v.", zh: "解放", en: "to set free" }],
    breakdown: [
      { part: "e", type: "prefix", zh: "出", refId: "affix-e" },
      { part: "man", type: "root", zh: "手", refId: "root-man" },
      { part: "cip", type: "none", zh: "拿/取" },
      { part: "ate", type: "suffix", zh: "使…", refId: "affix-ate" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The law emancipated slaves.", zh: "该法解放了奴隶。" }],
    assoc: { story: "构词:e(出) + man(手) + ate(使…) → 解放" } },
];
module.exports = words;
