const words = [
  { id: "graph", word: "graph", phonetic: "/ɡrɑːf/",
    senses: [{ pos: "n.", zh: "图表;曲线图", en: "a drawing that shows how two sets of numbers relate" }],
    breakdown: [
      { part: "graph", type: "root", zh: "写/画", refId: "root-graph" }
    ],
    tags: ["cet4"],
    examples: [{ en: "The graph shows the rise in temperature.", zh: "这张图表显示了气温的上升。" }],
    assoc: { story: "graph(画)= 画出来的图 → 图表。" } },
  { id: "photograph", word: "photograph", phonetic: "/ˈfəʊtəɡrɑːf/",
    senses: [{ pos: "n.", zh: "照片", en: "a picture made with a camera" }],
    breakdown: [
      { part: "photo", type: "prefix", zh: "光", refId: "affix-photo" },
      { part: "graph", type: "root", zh: "写/画", refId: "root-graph" }
    ],
    tags: ["cet4", "高频"],
    examples: [{ en: "I took a photograph of the sunset.", zh: "我拍了一张日落的照片。" }],
    assoc: { story: "photo(光)+graph(写/画) = 用光在胶片上作画 → 照片。" } },
  { id: "biography", word: "biography", phonetic: "/baɪˈɒɡrəfi/",
    senses: [{ pos: "n.", zh: "传记", en: "a life story" }],
    breakdown: [
      { part: "bio", type: "none", zh: "生命" },
      { part: "graph", type: "root", zh: "写/画", refId: "root-graph" },
      { part: "y", type: "suffix", zh: "…术", refId: "affix-y" }
    ],
    tags: ["cet6"],
    examples: [{ en: "He read a biography of Einstein.", zh: "他读了爱因斯坦的传记。" }],
    assoc: { story: "构词:graph(写/画) + y(…术) → 传记" } },
  { id: "geography", word: "geography", phonetic: "/dʒiˈɒɡrəfi/",
    senses: [{ pos: "n.", zh: "地理", en: "the study of Earth" }],
    breakdown: [
      { part: "geo", type: "none", zh: "地" },
      { part: "graph", type: "root", zh: "写/画", refId: "root-graph" },
      { part: "y", type: "suffix", zh: "…术", refId: "affix-y" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Geography explains climate.", zh: "地理解释气候。" }],
    assoc: { story: "构词:graph(写/画) + y(…术) → 地理" } },
  { id: "paragraph", word: "paragraph", phonetic: "/ˈpærəɡrɑːf/",
    senses: [{ pos: "n.", zh: "段落", en: "a section of text" }],
    breakdown: [
      { part: "para", type: "prefix", zh: "旁", refId: "affix-para" },
      { part: "graph", type: "root", zh: "写/画", refId: "root-graph" }
    ],
    tags: ["cet6"],
    examples: [{ en: "Start a new paragraph here.", zh: "从这里另起一段。" }],
    assoc: { story: "构词:para(旁) + graph(写/画) → 段落" } },
  { id: "autograph", word: "autograph", phonetic: "/ˈɔːtəɡrɑːf/",
    senses: [{ pos: "n.", zh: "亲笔签名", en: "a signed name" }],
    breakdown: [
      { part: "auto", type: "prefix", zh: "自己", refId: "affix-auto" },
      { part: "graph", type: "root", zh: "写/画", refId: "root-graph" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The fan got his autograph.", zh: "粉丝拿到了他的亲笔签名。" }],
    assoc: { story: "构词:auto(自己) + graph(写/画) → 亲笔签名" } },
  { id: "graphic", word: "graphic", phonetic: "/ˈɡræfɪk/",
    senses: [{ pos: "adj.", zh: "图表的；生动的", en: "of charts or vivid" }],
    breakdown: [
      { part: "graph", type: "root", zh: "写/画", refId: "root-graph" },
      { part: "ic", type: "suffix", zh: "…的", refId: "affix-ic" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The report has graphic charts.", zh: "报告里有图表。" }],
    assoc: { story: "构词:graph(写/画) + ic(…的) → 图表的" } },
  { id: "telegraph", word: "telegraph", phonetic: "/ˈtelɪɡrɑːf/",
    senses: [{ pos: "n.", zh: "电报", en: "an old message system" }],
    breakdown: [
      { part: "tele", type: "prefix", zh: "远", refId: "affix-tele" },
      { part: "graph", type: "root", zh: "写/画", refId: "root-graph" }
    ],
    tags: ["cet6"],
    examples: [{ en: "The telegraph sent news fast.", zh: "电报快速传递消息。" }],
    assoc: { story: "构词:tele(远) + graph(写/画) → 电报" } },
];
module.exports = words;
