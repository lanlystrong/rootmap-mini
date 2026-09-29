const words = [
  { id: "monarch", word: "monarch", phonetic: "'mɒnək",
    senses: [{ pos: "n.", zh: "君主；帝王", en: null }],
    breakdown: [
      { part: "mon", type: "none" },
      { part: "arch", type: "root", zh: "统治/首要", refId: "root-arch" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The monarch ruled the country for decades.", zh: "这位君主统治国家数十年。" }],
    assoc: { story: "构词:arch(统治/首要) → 君主" } },
  { id: "architect", word: "architect", phonetic: "'ɑːkɪtekt",
    senses: [{ pos: "n.", zh: "建筑师；设计者", en: null }],
    breakdown: [
      { part: "arch", type: "root", zh: "统治/首要", refId: "root-arch" },
      { part: "itect", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "She is the architect of the new library.", zh: "她是这座新图书馆的设计者。" }],
    assoc: { story: "构词:arch(统治/首要) → 建筑师" } },
  { id: "architecture", word: "architecture", phonetic: "'ɑːkɪtektʃə",
    senses: [{ pos: "n.", zh: "建筑学；建筑风格", en: null }],
    breakdown: [
      { part: "arch", type: "root", zh: "统治/首要", refId: "root-arch" },
      { part: "itecture", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Greek architecture influenced many buildings.", zh: "希腊建筑风格影响了众多建筑。" }],
    assoc: { story: "构词:arch(统治/首要) → 建筑学" } },
  { id: "anarchy", word: "anarchy", phonetic: "/ˈænəki/",
    senses: [{ pos: "n.", zh: "无政府状态", en: "absence of rule" }],
    breakdown: [
      { part: "an", type: "none", zh: "无" },
      { part: "arch", type: "root", zh: "统治/首要", refId: "root-arch" },
      { part: "y", type: "suffix", zh: "…术", refId: "affix-y" }
    ],
    tags: ["cet6"],
    examples: [{ en: "War brought anarchy.", zh: "战争带来无政府状态。" }],
    assoc: { story: "构词:arch(统治/首要) + y(…术) → 无政府状态" } },
  { id: "monarchy", word: "monarchy", phonetic: "/ˈmɒnəki/",
    senses: [{ pos: "n.", zh: "君主制", en: "rule by one person" }],
    breakdown: [
      { part: "mon", type: "none", zh: "单独" },
      { part: "arch", type: "root", zh: "统治/首要", refId: "root-arch" },
      { part: "y", type: "suffix", zh: "…术", refId: "affix-y" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The country is a monarchy.", zh: "该国是君主制。" }],
    assoc: { story: "构词:arch(统治/首要) + y(…术) → 君主制" } },
  { id: "matriarch", word: "matriarch", phonetic: "/ˈmeɪtriɑːk/",
    senses: [{ pos: "n.", zh: "女家长", en: "a female ruler of a family" }],
    breakdown: [
      { part: "matri", type: "none", zh: "母" },
      { part: "arch", type: "root", zh: "统治/首要", refId: "root-arch" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The grandmother was the matriarch.", zh: "祖母是家族的女家长。" }],
    assoc: { story: "构词:arch(统治/首要) → 女家长" } },
  { id: "patriarchy", word: "patriarchy", phonetic: "/ˈpeɪtriɑːki/",
    senses: [{ pos: "n.", zh: "父权制", en: "rule by men" }],
    breakdown: [
      { part: "patri", type: "none", zh: "父" },
      { part: "arch", type: "root", zh: "统治/首要", refId: "root-arch" },
      { part: "y", type: "suffix", zh: "…术", refId: "affix-y" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The society was a patriarchy.", zh: "该社会是父权制。" }],
    assoc: { story: "构词:arch(统治/首要) + y(…术) → 父权制" } },
  { id: "archive", word: "archive", phonetic: "/ˈɑːkaɪv/",
    senses: [{ pos: "n.", zh: "档案", en: "a place for records" }],
    breakdown: [
      { part: "arch", type: "root", zh: "统治/首要", refId: "root-arch" },
      { part: "ive", type: "suffix", zh: "…的", refId: "affix-ive" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The archive holds old letters.", zh: "档案馆收藏着旧信件。" }],
    assoc: { story: "构词:arch(统治/首要) + ive(…的) → 档案" } },
];
module.exports = words;
