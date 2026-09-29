const words = [
  { id: "bible", word: "bible", phonetic: "'baɪbl",
    senses: [{ pos: "n.", zh: "圣经；经典", en: null }],
    breakdown: [
      { part: "bibl", type: "root", zh: "书", refId: "root-bibl" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The Bible is a sacred book for Christians.", zh: "《圣经》是基督徒的圣典。" }],
    assoc: { story: "构词:bibl(书) → 圣经" } },
  { id: "bibliography", word: "bibliography", phonetic: "ˌbɪbli'ɒgrəfi",
    senses: [{ pos: "n.", zh: "参考书目；文献目录", en: null }],
    breakdown: [
      { part: "bibl", type: "root", zh: "书", refId: "root-bibl" },
      { part: "iography", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The thesis ends with a bibliography.", zh: "这篇论文以参考书目结尾。" }],
    assoc: { story: "构词:bibl(书) → 参考书目" } },
  { id: "biblical", word: "biblical", phonetic: "/ˈbɪblɪkl/",
    senses: [{ pos: "adj.", zh: "圣经的", en: "of the Bible" }],
    breakdown: [
      { part: "bibl", type: "root", zh: "书", refId: "root-bibl" },
      { part: "ical", type: "none", zh: "…的" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He quoted a biblical line.", zh: "他引用了一句圣经经文。" }],
    assoc: { story: "构词:bibl(书) → 圣经的" } },
  { id: "bibliophile", word: "bibliophile", phonetic: "/ˈbɪbliəfaɪl/",
    senses: [{ pos: "n.", zh: "藏书家", en: "a lover of books" }],
    breakdown: [
      { part: "bibl", type: "root", zh: "书", refId: "root-bibl" },
      { part: "io", type: "none" },
      { part: "phil", type: "none", zh: "爱" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The bibliophile collected first editions.", zh: "藏书家收集初版书。" }],
    assoc: { story: "构词:bibl(书) → 藏书家" } },
];
module.exports = words;
