const words = [
  { id: "inspect", word: "inspect", phonetic: "/ɪnˈspekt/",
    senses: [{ pos: "v.", zh: "检查;审视", en: "to look at something carefully to find problems" }],
    breakdown: [
      { part: "in", type: "prefix", zh: "向内/凑近", refId: "affix-in" },
      { part: "spect", type: "root", zh: "看", refId: "root-spect" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "The engineer inspected the bridge for cracks.", zh: "工程师检查了桥梁是否有裂缝。" }],
    assoc: { story: undefined } },
  { id: "respect", word: "respect", phonetic: "/rɪˈspekt/",
    senses: [{ pos: "v.", zh: "尊重;尊敬", en: "to admire someone and treat them well" }],
    breakdown: [
      { part: "re", type: "prefix", zh: "再次/回", refId: "affix-re" },
      { part: "spect", type: "root", zh: "看", refId: "root-spect" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "Students should respect their teachers.", zh: "学生应当尊重老师。" }],
    assoc: { story: "re(一再)+spect(看)= 一再回头(看重)对方 → 尊重、敬重。" } },
  { id: "prospect", word: "prospect", phonetic: "/ˈprɒspekt/",
    senses: [{ pos: "n.", zh: "前景;可能性", en: "the possibility that something good will happen" }],
    breakdown: [
      { part: "pro", type: "prefix", zh: "向前", refId: "affix-pro" },
      { part: "spect", type: "root", zh: "看", refId: "root-spect" }
    ],
    tags: ["cet4"],
    examples: [{ en: "There is little prospect of rain today.", zh: "今天下雨的可能性很小。" }],
    assoc: { story: undefined } },
  { id: "spectator", word: "spectator", phonetic: "/spekˈteɪtə/",
    senses: [{ pos: "n.", zh: "观众;旁观者", en: "a person who is watching an event or game" }],
    breakdown: [
      { part: "spect", type: "root", zh: "看", refId: "root-spect" },
      { part: "ator", type: "suffix", zh: "…的人", refId: "affix-ator" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The spectators cheered the players.", zh: "观众为选手们欢呼。" }],
    assoc: { story: undefined } },
  { id: "perspective", word: "perspective", phonetic: "/pəˈspektɪv/",
    senses: [{ pos: "n.", zh: "观点;视角", en: "a particular way of thinking about something" }],
    breakdown: [
      { part: "per", type: "prefix", zh: "透过/贯穿", refId: "affix-per" },
      { part: "spect", type: "root", zh: "看", refId: "root-spect" },
      { part: "ive", type: "suffix", zh: "…的", refId: "affix-ive" }
    ],
    tags: ["cet4"],
    examples: [{ en: "From my perspective, the plan is too risky.", zh: "在我看来,这个计划风险太大。" }],
    assoc: { story: undefined } },
  { id: "retrospect", word: "retrospect", phonetic: "/ˈretrəspekt/",
    senses: [{ pos: "n.", zh: "回顾;回想", en: "thinking about past events (in retrospect)" }],
    breakdown: [
      { part: "retro", type: "prefix", zh: "向后", refId: "affix-retro" },
      { part: "spect", type: "root", zh: "看", refId: "root-spect" }
    ],
    tags: ["cet6"],
    examples: [{ en: "In retrospect, I should have taken the job.", zh: "回首往事,我本应接受那份工作。" }],
    assoc: { story: undefined } },
  { id: "spectacle", word: "spectacle", phonetic: "/ˈspektəkl/",
    senses: [{ pos: "n.", zh: "奇观；景象", en: "a strange or impressive sight" }],
    breakdown: [
      { part: "spec", type: "root", zh: "看", refId: "root-spect" },
      { part: "tacle", type: "none", zh: "…物" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The sunrise over the lake was a beautiful spectacle.", zh: "湖上的日出是一幅美丽的奇观。" }],
    assoc: { story: "构词:spec(看) → 奇观" } },
  { id: "spectacular", word: "spectacular", phonetic: "/spekˈtækjələ/",
    senses: [{ pos: "adj.", zh: "壮观的", en: "very impressive to look at" }],
    breakdown: [
      { part: "spec", type: "root", zh: "看", refId: "root-spect" },
      { part: "tacular", type: "none", zh: "…的" }
    ],
    tags: ["cet6"],
    examples: [{ en: "They watched a spectacular fireworks show.", zh: "他们观看了一场壮观的烟火表演。" }],
    assoc: { story: "构词:spec(看) → 壮观的" } },
  { id: "circumspect", word: "circumspect", phonetic: "/ˈsɜːkəmspekt/",
    senses: [{ pos: "adj.", zh: "谨慎的", en: "careful to consider risks" }],
    breakdown: [
      { part: "circum", type: "none", zh: "环绕" },
      { part: "spect", type: "root", zh: "看", refId: "root-spect" }
    ],
    tags: ["cet6"],
    examples: [{ en: "A circumspect investor avoids big risks.", zh: "谨慎的投资者会避开大风险。" }],
    assoc: { story: "构词:spect(看) → 谨慎的" } },
  { id: "introspect", word: "introspect", phonetic: "/ˌɪntrəˈspekt/",
    senses: [{ pos: "v.", zh: "内省", en: "to examine your own thoughts" }],
    breakdown: [
      { part: "intro", type: "prefix", zh: "向内", refId: "affix-intro" },
      { part: "spect", type: "root", zh: "看", refId: "root-spect" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He paused to introspect about his choices.", zh: "他停下来反省自己的选择。" }],
    assoc: { story: "构词:intro(向内) + spect(看) → 内省" } },
  { id: "aspect", word: "aspect", phonetic: "/ˈæspekt/",
    senses: [{ pos: "n.", zh: "方面；面貌", en: "a particular part or feature" }],
    breakdown: [
      { part: "a", type: "prefix", zh: "朝向", refId: "affix-a" },
      { part: "spect", type: "root", zh: "看", refId: "root-spect" }
    ],
    tags: ["cet6"],
    examples: [{ en: "We must study every aspect of the problem.", zh: "我们必须研究这个问题的各个方面。" }],
    assoc: { story: "构词:a(朝向) + spect(看) → 方面" } },
];
module.exports = words;
