const words = [
  { id: "neurology", word: "neurology", phonetic: "njʊə'rɒlədʒi",
    senses: [{ pos: "n.", zh: "神经学", en: null }],
    breakdown: [
      { part: "neur", type: "root", zh: "神经", refId: "root-neur" },
      { part: "ology", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He specializes in neurology.", zh: "他专攻神经学。" }],
    assoc: { story: "构词:neur(神经) → 神经学" } },
  { id: "neurological", word: "neurological", phonetic: "ˌnjʊərə'lɒdʒɪkl",
    senses: [{ pos: "adj.", zh: "神经的；神经学的", en: null }],
    breakdown: [
      { part: "neur", type: "root", zh: "神经", refId: "root-neur" },
      { part: "ological", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "She suffered a neurological disorder.", zh: "她患有神经系统疾病。" }],
    assoc: { story: "构词:neur(神经) → 神经的" } },
  { id: "neuron", word: "neuron", phonetic: "'njʊərɒn",
    senses: [{ pos: "n.", zh: "神经元；神经细胞", en: null }],
    breakdown: [
      { part: "neur", type: "root", zh: "神经", refId: "root-neur" },
      { part: "on", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "A neuron transmits signals in the brain.", zh: "神经元在大脑中传递信号。" }],
    assoc: { story: "构词:neur(神经) → 神经元" } },
  { id: "neural", word: "neural", phonetic: "/ˈnjʊərəl/",
    senses: [{ pos: "adj.", zh: "神经的", en: "of the nerves" }],
    breakdown: [
      { part: "neur", type: "root", zh: "神经", refId: "root-neur" },
      { part: "al", type: "suffix", zh: "…的", refId: "affix-al" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Neural signals travel fast.", zh: "神经信号传导很快。" }],
    assoc: { story: "构词:neur(神经) + al(…的) → 神经的" } },
  { id: "neurosis", word: "neurosis", phonetic: "/njʊˈrəʊsɪs/",
    senses: [{ pos: "n.", zh: "神经症", en: "a mild mental disorder" }],
    breakdown: [
      { part: "neur", type: "root", zh: "神经", refId: "root-neur" },
      { part: "osis", type: "none", zh: "…症" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He suffered from neurosis.", zh: "他患有神经症。" }],
    assoc: { story: "构词:neur(神经) → 神经症" } },
  { id: "neurologist", word: "neurologist", phonetic: "/njʊˈrɒlədʒɪst/",
    senses: [{ pos: "n.", zh: "神经科医生", en: "a brain-nerve doctor" }],
    breakdown: [
      { part: "neur", type: "root", zh: "神经", refId: "root-neur" },
      { part: "o", type: "none" },
      { part: "log", type: "none", zh: "说/学科" },
      { part: "ist", type: "none", zh: "…者" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The neurologist examined him.", zh: "神经科医生给他做了检查。" }],
    assoc: { story: "构词:neur(神经) → 神经科医生" } },
];
module.exports = words;
