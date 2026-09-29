const words = [
  { id: "attend", word: "attend", phonetic: "/əˈtend/",
    senses: [{ pos: "v.", zh: "出席;参加", en: "to be present at a meeting, class or event" }],
    breakdown: [
      { part: "at", type: "prefix", zh: "朝向", refId: "affix-ad" },
      { part: "tend", type: "root", zh: "伸向", refId: "root-tend" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "She attended the meeting yesterday.", zh: "她昨天出席了会议。" }],
    assoc: { story: "at(ad- 朝向,在 t 前同化)+tend(伸向)= 把注意力伸向 → 出席、照料。" } },
  { id: "attention", word: "attention", phonetic: "/əˈtenʃn/",
    senses: [{ pos: "n.", zh: "注意;关注", en: "the act of listening to or looking at something carefully" }],
    breakdown: [
      { part: "at", type: "prefix", zh: "朝向", refId: "affix-ad" },
      { part: "tent", type: "root", zh: "伸向", refId: "root-tend" },
      { part: "ion", type: "suffix", zh: "名词后缀", refId: "affix-ion" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "Please pay attention to the teacher.", zh: "请注意听老师讲。" }],
    assoc: { story: "at(朝向)+tent(伸向)+ion = 把心思伸过去 → 注意、关注。" } },
  { id: "intention", word: "intention", phonetic: "/ɪnˈtenʃn/",
    senses: [{ pos: "n.", zh: "意图;打算", en: "what you intend or plan to do" }],
    breakdown: [
      { part: "in", type: "prefix", zh: "朝向", refId: "affix-in" },
      { part: "tent", type: "root", zh: "伸向", refId: "root-tend" },
      { part: "ion", type: "suffix", zh: "名词后缀", refId: "affix-ion" }
    ],
    tags: ["cet4"],
    examples: [{ en: "He has no intention of giving up.", zh: "他没有放弃的打算。" }],
    assoc: { story: "in(朝向)+tent(伸)+ion = 心里的指向 → 意图、打算。" } },
  { id: "extend", word: "extend", phonetic: "/ɪkˈstend/",
    senses: [{ pos: "v.", zh: "延伸;扩大", en: "to make something longer, larger or cover a larger area" }],
    breakdown: [
      { part: "ex", type: "prefix", zh: "向外", refId: "affix-ex" },
      { part: "tend", type: "root", zh: "伸", refId: "root-tend" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "We plan to extend the railway to the coast.", zh: "我们计划把铁路延伸到海边。" }],
    assoc: { story: "ex(向外)+tend(伸)= 向外伸 → 延伸、扩展。" } },
  { id: "extension", word: "extension", phonetic: "/ɪkˈstenʃn/",
    senses: [{ pos: "n.", zh: "延伸;扩建部分", en: "a part added to a building to make it bigger" }],
    breakdown: [
      { part: "ex", type: "prefix", zh: "向外", refId: "affix-ex" },
      { part: "tens", type: "root", zh: "伸", refId: "root-tend" },
      { part: "ion", type: "suffix", zh: "名词后缀", refId: "affix-ion" }
    ],
    tags: ["cet6"],
    examples: [{ en: "They built an extension to the kitchen.", zh: "他们给厨房加盖了一间。" }],
    assoc: { story: "ex(向外)+tens(伸)+ion = 伸出去的部分 → 扩建、延伸。" } },
  { id: "extensive", word: "extensive", phonetic: "/ɪkˈstensɪv/",
    senses: [{ pos: "adj.", zh: "广泛的;大规模的", en: "covering a large area or a large amount" }],
    breakdown: [
      { part: "ex", type: "prefix", zh: "向外", refId: "affix-ex" },
      { part: "tens", type: "root", zh: "伸", refId: "root-tend" },
      { part: "ive", type: "suffix", zh: "…的", refId: "affix-ive" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The storm caused extensive damage.", zh: "风暴造成了大范围的破坏。" }],
    assoc: { story: "ex(向外)+tens(伸)+ive = 向四周伸展开的 → 广泛的。" } },
  { id: "pretend", word: "pretend", phonetic: "/prɪˈtend/",
    senses: [{ pos: "v.", zh: "假装;佯称", en: "to behave as if something is true when it is not" }],
    breakdown: [
      { part: "pre", type: "prefix", zh: "预先", refId: "affix-pre" },
      { part: "tend", type: "root", zh: "伸", refId: "root-tend" }
    ],
    tags: ["cet4"],
    examples: [{ en: "He pretended not to hear me.", zh: "他假装没听见我说话。" }],
    assoc: { story: "pre(预先)+tend(伸)= 事先把假象伸出来 → 假装。" } },
  { id: "intend", word: "intend", phonetic: "/ɪnˈtend/",
    senses: [{ pos: "v.", zh: "打算", en: "to plan" }],
    breakdown: [
      { part: "in", type: "prefix", zh: "入", refId: "affix-in" },
      { part: "tend", type: "root", zh: "伸向", refId: "root-tend" }
    ],
    tags: ["cet6"],
    examples: [{ en: "I intend to leave early.", zh: "我打算早点走。" }],
    assoc: { story: "构词:in(入) + tend(伸向) → 打算" } },
  { id: "contend", word: "contend", phonetic: "/kənˈtend/",
    senses: [{ pos: "v.", zh: "竞争；主张", en: "to compete or argue" }],
    breakdown: [
      { part: "con", type: "prefix", zh: "共同", refId: "affix-con" },
      { part: "tend", type: "root", zh: "伸向", refId: "root-tend" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Two teams contend for the title.", zh: "两队争夺冠军。" }],
    assoc: { story: "构词:con(共同) + tend(伸向) → 竞争" } },
  { id: "tension", word: "tension", phonetic: "/ˈtenʃn/",
    senses: [{ pos: "n.", zh: "紧张；张力", en: "mental strain or pull" }],
    breakdown: [
      { part: "tens", type: "root", zh: "伸向", refId: "root-tend" },
      { part: "ion", type: "suffix", zh: "…的状态", refId: "affix-ion" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The tension in the room was high.", zh: "房间里的气氛很紧张。" }],
    assoc: { story: "构词:tens(伸向) + ion(…的状态) → 紧张" } },
  { id: "intense", word: "intense", phonetic: "/ɪnˈtens/",
    senses: [{ pos: "adj.", zh: "强烈的", en: "very strong" }],
    breakdown: [
      { part: "in", type: "prefix", zh: "入", refId: "affix-in" },
      { part: "tens", type: "root", zh: "伸向", refId: "root-tend" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The heat was intense.", zh: "酷热难耐。" }],
    assoc: { story: "构词:in(入) + tens(伸向) → 强烈的" } },
  { id: "tendency", word: "tendency", phonetic: "/ˈtendənsi/",
    senses: [{ pos: "n.", zh: "趋势", en: "a leaning toward" }],
    breakdown: [
      { part: "tend", type: "root", zh: "伸向", refId: "root-tend" },
      { part: "ency", type: "none", zh: "…的性质" }
    ],
    tags: ["cet6"],
    examples: [{ en: "There is a tendency to rise.", zh: "有上升的趋势。" }],
    assoc: { story: "构词:tend(伸向) → 趋势" } },
  { id: "content", word: "content", phonetic: "/kənˈtent/",
    senses: [{ pos: "adj.", zh: "满足的", en: "satisfied" }],
    breakdown: [
      { part: "con", type: "prefix", zh: "共同", refId: "affix-con" },
      { part: "tent", type: "root", zh: "伸向", refId: "root-tend" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The cat looked content.", zh: "猫看起来很满足。" }],
    assoc: { story: "构词:con(共同) + tent(伸向) → 满足的" } },
];
module.exports = words;
