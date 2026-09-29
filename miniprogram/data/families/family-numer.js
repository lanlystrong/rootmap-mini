const words = [
  { id: "number", word: "number", phonetic: "/ˈnʌmbə/",
    senses: [{ pos: "n.", zh: "数字;号码;数量", en: "a word or symbol used for counting; an amount" }],
    breakdown: [
      { part: "num", type: "root", zh: "数", refId: "root-numer" },
      { part: "ber", type: "none" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "Please write your phone number here.", zh: "请在这里写下你的电话号码。" }],
    assoc: { story: "num(数)+ber = 数出来的符号 → 数字、号码。" } },
  { id: "numerous", word: "numerous", phonetic: "/ˈnjuːmərəs/",
    senses: [{ pos: "adj.", zh: "许多的;众多的", en: "existing in large numbers" }],
    breakdown: [
      { part: "numer", type: "root", zh: "数", refId: "root-numer" },
      { part: "ous", type: "suffix", zh: "充满…的", refId: "affix-ous" }
    ],
    tags: ["cet6"],
    examples: [{ en: "She has numerous friends around the world.", zh: "她在世界各地有许多朋友。" }],
    assoc: { story: "numer(数)+ous = 数不过来的 → 众多的。" } },
  { id: "numeral", word: "numeral", phonetic: "/ˈnjuːmərəl/",
    senses: [{ pos: "n.", zh: "数字", en: "a symbol for a number" }],
    breakdown: [
      { part: "numer", type: "root", zh: "数", refId: "root-numer" },
      { part: "al", type: "suffix", zh: "…的", refId: "affix-al" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Roman numerals are still used.", zh: "罗马数字仍在使用。" }],
    assoc: { story: "构词:numer(数) + al(…的) → 数字" } },
  { id: "numerical", word: "numerical", phonetic: "/njuːˈmerɪkl/",
    senses: [{ pos: "adj.", zh: "数字的", en: "of numbers" }],
    breakdown: [
      { part: "numer", type: "root", zh: "数", refId: "root-numer" },
      { part: "ical", type: "none", zh: "…的" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The data is numerical.", zh: "数据是数值型的。" }],
    assoc: { story: "构词:numer(数) → 数字的" } },
  { id: "enumerate", word: "enumerate", phonetic: "/ɪˈnjuːməreɪt/",
    senses: [{ pos: "v.", zh: "列举", en: "to list one by one" }],
    breakdown: [
      { part: "e", type: "prefix", zh: "出", refId: "affix-e" },
      { part: "numer", type: "root", zh: "数", refId: "root-numer" },
      { part: "ate", type: "suffix", zh: "使…", refId: "affix-ate" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Enumerate your reasons.", zh: "逐条列出你的理由。" }],
    assoc: { story: "构词:e(出) + numer(数) + ate(使…) → 列举" } },
];
module.exports = words;
