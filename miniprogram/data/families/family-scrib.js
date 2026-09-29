const words = [
  { id: "describe", word: "describe", phonetic: "/dɪˈskraɪb/",
    senses: [{ pos: "v.", zh: "描述;描写", en: "to say or write what something is like" }],
    breakdown: [
      { part: "de", type: "prefix", zh: "向下/加强", refId: "affix-de" },
      { part: "scrib", type: "root", zh: "写", refId: "root-scrib" },
      { part: "e", type: "none" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "Can you describe the man you saw?", zh: "你能描述一下你看到的那个人吗？" }],
    assoc: { story: undefined } },
  { id: "description", word: "description", phonetic: "/dɪˈskrɪpʃn/",
    senses: [{ pos: "n.", zh: "描述;描写", en: "a spoken or written account of what something is like" }],
    breakdown: [
      { part: "de", type: "prefix", zh: "向下/加强", refId: "affix-de" },
      { part: "script", type: "root", zh: "写", refId: "root-scrib" },
      { part: "ion", type: "suffix", zh: "名词后缀", refId: "affix-ion" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "The description of the suspect was very clear.", zh: "对嫌疑人的描述非常清楚。" }],
    assoc: { story: undefined } },
  { id: "prescription", word: "prescription", phonetic: "/prɪˈskrɪpʃn/",
    senses: [{ pos: "n.", zh: "处方;药方", en: "a piece of paper on which a doctor writes the medicine you need" }],
    breakdown: [
      { part: "pre", type: "prefix", zh: "预先", refId: "affix-pre" },
      { part: "script", type: "root", zh: "写", refId: "root-scrib" },
      { part: "ion", type: "suffix", zh: "名词后缀", refId: "affix-ion" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The doctor wrote me a prescription for my cough.", zh: "医生给我开了一张治咳嗽的处方。" }],
    assoc: { story: "pre(预先)+script(写)+ion = 预先写好的用药单 → 处方。" } },
  { id: "script", word: "script", phonetic: "/skrɪpt/",
    senses: [{ pos: "n.", zh: "剧本；手迹", en: "written text of a play" }],
    breakdown: [
      { part: "script", type: "root", zh: "写", refId: "root-scrib" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The actor memorized the script.", zh: "演员背熟了剧本。" }],
    assoc: { story: "构词:script(写) → 剧本" } },
  { id: "manuscript", word: "manuscript", phonetic: "/ˈmænjuskrɪpt/",
    senses: [{ pos: "n.", zh: "手稿", en: "a document written by hand" }],
    breakdown: [
      { part: "manu", type: "none", zh: "手" },
      { part: "script", type: "root", zh: "写", refId: "root-scrib" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The museum kept an old manuscript.", zh: "博物馆收藏着一份古老手稿。" }],
    assoc: { story: "构词:script(写) → 手稿" } },
  { id: "prescribe", word: "prescribe", phonetic: "/prɪˈskraɪb/",
    senses: [{ pos: "v.", zh: "开处方；规定", en: "to order a medicine" }],
    breakdown: [
      { part: "pre", type: "prefix", zh: "先", refId: "affix-pre" },
      { part: "scrib", type: "root", zh: "写", refId: "root-scrib" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The doctor prescribed some pills.", zh: "医生开了一些药丸。" }],
    assoc: { story: "构词:pre(先) + scrib(写) → 开处方" } },
  { id: "subscribe", word: "subscribe", phonetic: "/səbˈskraɪb/",
    senses: [{ pos: "v.", zh: "订阅", en: "to pay for regular issues" }],
    breakdown: [
      { part: "sub", type: "prefix", zh: "在下", refId: "affix-sub" },
      { part: "scrib", type: "root", zh: "写", refId: "root-scrib" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "I subscribe to a science magazine.", zh: "我订阅了一本科学杂志。" }],
    assoc: { story: "构词:sub(在下) + scrib(写) → 订阅" } },
  { id: "transcribe", word: "transcribe", phonetic: "/trænˈskraɪb/",
    senses: [{ pos: "v.", zh: "转录", en: "to write down from speech" }],
    breakdown: [
      { part: "tran", type: "none", zh: "横越" },
      { part: "scrib", type: "root", zh: "写", refId: "root-scrib" },
      { part: "e", type: "none" }
    ],
    tags: ["cet6"],
    examples: [{ en: "She transcribed the interview.", zh: "她把访谈记录成文字。" }],
    assoc: { story: "构词:scrib(写) → 转录" } },
  { id: "inscription", word: "inscription", phonetic: "/ɪnˈskrɪpʃn/",
    senses: [{ pos: "n.", zh: "铭文", en: "words carved on a surface" }],
    breakdown: [
      { part: "in", type: "prefix", zh: "入", refId: "affix-in" },
      { part: "script", type: "root", zh: "写", refId: "root-scrib" },
      { part: "ion", type: "suffix", zh: "…的状态", refId: "affix-ion" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The stone bore an ancient inscription.", zh: "石碑上刻着古老的铭文。" }],
    assoc: { story: "构词:in(入) + script(写) + ion(…的状态) → 铭文" } },
  { id: "scribble", word: "scribble", phonetic: "/ˈskrɪbl/",
    senses: [{ pos: "v.", zh: "涂鸦", en: "to write carelessly" }],
    breakdown: [
      { part: "scrib", type: "root", zh: "写", refId: "root-scrib" },
      { part: "b", type: "none" },
      { part: "le", type: "none", zh: "小/反复" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The child scribbled on the wall.", zh: "孩子在墙上胡乱涂画。" }],
    assoc: { story: "构词:scrib(写) → 涂鸦" } },
];
module.exports = words;
