const words = [
  { id: "antagonist", word: "antagonist", phonetic: "æn'tægənɪst",
    senses: [{ pos: "n.", zh: "对手；对立者", en: null }],
    breakdown: [
      { part: "ant", type: "none" },
      { part: "agon", type: "root", zh: "斗争/竞赛", refId: "root-agon" },
      { part: "ist", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The hero fought his antagonist.", zh: "主人公与对手交锋。" }],
    assoc: { story: "构词:agon(斗争/竞赛) → 对手" } },
  { id: "agony", word: "agony", phonetic: "'ægəni",
    senses: [{ pos: "n.", zh: "极度痛苦；挣扎", en: null }],
    breakdown: [
      { part: "agon", type: "root", zh: "斗争/竞赛", refId: "root-agon" },
      { part: "y", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "She was in agony after the accident.", zh: "事故发生后她痛苦不堪。" }],
    assoc: { story: "构词:agon(斗争/竞赛) → 极度痛苦" } },
  { id: "agonize", word: "agonize", phonetic: "'ægənaɪz",
    senses: [{ pos: "v.", zh: "感到极度痛苦；苦苦思索", en: null }],
    breakdown: [
      { part: "agon", type: "root", zh: "斗争/竞赛", refId: "root-agon" },
      { part: "ize", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He agonized over the difficult decision.", zh: "他为该艰难决定苦苦纠结。" }],
    assoc: { story: "构词:agon(斗争/竞赛) → 感到极度痛苦" } },
  { id: "protagonist", word: "protagonist", phonetic: "/prəˈtæɡənɪst/",
    senses: [{ pos: "n.", zh: "主角；主人公", en: "the main character" }],
    breakdown: [
      { part: "pro", type: "prefix", zh: "向前", refId: "affix-pro" },
      { part: "t", type: "none" },
      { part: "agon", type: "root", zh: "斗争/竞赛", refId: "root-agon" },
      { part: "ist", type: "none", zh: "…者" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The protagonist faced a crisis.", zh: "主人公面临危机。" }],
    assoc: { story: "构词:pro(向前) + agon(斗争/竞赛) → 主角" } },
  { id: "antagonize", word: "antagonize", phonetic: "/ænˈtæɡənaɪz/",
    senses: [{ pos: "v.", zh: "使敌对", en: "to make an enemy of" }],
    breakdown: [
      { part: "ant", type: "none", zh: "相对" },
      { part: "agon", type: "root", zh: "斗争/竞赛", refId: "root-agon" },
      { part: "ize", type: "none", zh: "使…" }
    ],
    tags: ["cet6"],
    examples: [{ en: "His tone antagonized them.", zh: "他的语气激怒了他们。" }],
    assoc: { story: "构词:agon(斗争/竞赛) → 使敌对" } },
];
module.exports = words;
