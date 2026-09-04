const words = [
  { id: 'graph', word: 'graph', phonetic: '/ɡrɑːf/',
    senses: [{ pos: 'n.', zh: '图表;曲线图', en: 'a drawing that shows how two sets of numbers relate' }],
    breakdown: [
      { part: 'graph', type: 'root', zh: '写/画', refId: 'root-graph' },
    ],
    tags: ['cet4'],
    examples: [
      { en: 'The graph shows the rise in temperature.', zh: '这张图表显示了气温的上升。' },
    ],
    assoc: { story: 'graph(画)= 画出来的图 → 图表。' } },
  { id: 'graphic', word: 'graphic', phonetic: '/ˈɡræfɪk/',
    senses: [{ pos: 'adj.', zh: '图表的;绘画的', en: 'connected with drawing, design or pictures' }],
    breakdown: [
      { part: 'graph', type: 'root', zh: '写/画', refId: 'root-graph' },
      { part: 'ic', type: 'suffix', zh: '…的', refId: 'affix-ic' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'She works as a graphic designer.', zh: '她是一名平面设计师。' },
    ],
    assoc: { story: 'graph(画)+ic(…的)= 与画有关的 → 图表的、绘画的。' } },
  { id: 'photograph', word: 'photograph', phonetic: '/ˈfəʊtəɡrɑːf/',
    senses: [{ pos: 'n.', zh: '照片', en: 'a picture made with a camera' },
             { pos: 'v.', zh: '拍照;摄影', en: 'to take a picture of someone or something' }],
    breakdown: [
      { part: 'photo', type: 'prefix', zh: '光', refId: 'affix-photo' },
      { part: 'graph', type: 'root', zh: '写/画', refId: 'root-graph' },
    ],
    tags: ['cet4', '高频'],
    examples: [
      { en: 'I took a photograph of the sunset.', zh: '我拍了一张日落的照片。' },
    ],
    assoc: { story: 'photo(光)+graph(写/画) = 用光在胶片上作画 → 照片。' } },
  { id: 'paragraph', word: 'paragraph', phonetic: '/ˈpærəɡrɑːf/',
    senses: [{ pos: 'n.', zh: '段落', en: 'a section of a piece of writing' }],
    breakdown: [
      { part: 'para', type: 'prefix', zh: '旁边/并列', refId: 'affix-para' },
      { part: 'graph', type: 'root', zh: '写', refId: 'root-graph' },
    ],
    tags: ['cet4'],
    examples: [
      { en: 'Translate the first paragraph into Chinese.', zh: '把第一段翻译成中文。' },
    ],
    assoc: { story: 'para(旁)+graph(写) = 写在正文旁、另起一行的文字 → 段落。' } },
  { id: 'biography', word: 'biography', phonetic: '/baɪˈɒɡrəfi/',
    senses: [{ pos: 'n.', zh: '传记', en: 'the story of a person’s life written by someone else' }],
    breakdown: [
      { part: 'bio', type: 'prefix', zh: '生命', refId: 'affix-bio' },
      { part: 'graph', type: 'root', zh: '写', refId: 'root-graph' },
      { part: 'y', type: 'suffix', zh: '名词后缀', refId: 'affix-y' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'He wrote a biography of the famous scientist.', zh: '他写了一本这位著名科学家的传记。' },
    ],
    assoc: { story: 'bio(生命)+graph(写)+y = 写一个人一生的文字 → 传记。' } },
  { id: 'geography', word: 'geography', phonetic: '/dʒiˈɒɡrəfi/',
    senses: [{ pos: 'n.', zh: '地理(学)', en: 'the study of the earth’s surface, countries, maps and so on' }],
    breakdown: [
      { part: 'geo', type: 'prefix', zh: '地球/土地', refId: 'affix-geo' },
      { part: 'graph', type: 'root', zh: '写/描述', refId: 'root-graph' },
      { part: 'y', type: 'suffix', zh: '名词后缀', refId: 'affix-y' },
    ],
    tags: ['cet4'],
    examples: [
      { en: 'We are learning about rivers in geography class.', zh: '我们在地理课上学河流。' },
    ],
    assoc: { story: 'geo(大地)+graph(描述)+y = 描述大地的学问 → 地理学。' } },
  { id: 'autograph', word: 'autograph', phonetic: '/ˈɔːtəɡrɑːf/',
    senses: [{ pos: 'n.', zh: '(名人的)亲笔签名', en: 'a famous person’s signature, especially given to a fan' }],
    breakdown: [
      { part: 'auto', type: 'prefix', zh: '自己', refId: 'affix-auto' },
      { part: 'graph', type: 'root', zh: '写', refId: 'root-graph' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'The fans asked the star for his autograph.', zh: '粉丝们请那位明星签名。' },
    ],
    assoc: { story: 'auto(自己)+graph(写) = 自己亲笔写下的名字 → 亲笔签名。' } },
  { id: 'telegraph', word: 'telegraph', phonetic: '/ˈtelɪɡrɑːf/',
    senses: [{ pos: 'n.', zh: '电报;电报机', en: 'an old system for sending messages over long distances' }],
    breakdown: [
      { part: 'tele', type: 'prefix', zh: '远', refId: 'affix-tele' },
      { part: 'graph', type: 'root', zh: '写', refId: 'root-graph' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'Before the telephone, people used the telegraph.', zh: '电话出现之前,人们用电报。' },
    ],
    assoc: { story: 'tele(远)+graph(写) = 从远处传来的文字信息 → 电报。' } },
];
module.exports = words;
