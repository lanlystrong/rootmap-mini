// 由 server/scripts/generate-content.js 生成,请勿手改;手写内容见 ../roots.js ../affixes.js ../families/
// 输入指纹: 手写层 465c3c8fb5eb3a1f627f57ee19a89c14ca931b80 / 产物 26d51f6b8add60535535a5fffc75dbb5089db90e
const words = [
{"id":"context","word":"context","phonetic":"'kɑntɛkst","senses":[{"pos":"n","zh":"背景，环境","en":null}],"breakdown":[{"part":"con","type":"prefix","zh":"共同/加强","refId":"affix-con"},{"part":"text","type":"root","zh":"编织","refId":"root-text"}],"tags":["cet4","高频"],"examples":[{"en":"The meaning of ‘mad’ depends on its context. mad","zh":"一词的意义要视上下文而定。"}],"assoc":{"story":"构词:con(共同/加强) + text(编织) → 背景"}},
{"id":"text","word":"text","phonetic":"tɛkst","senses":[{"pos":"n","zh":"[计] 文本；课文；主题","en":null},{"pos":"v","zh":"发短信","en":null}],"breakdown":[{"part":"text","type":"root","zh":"编织","refId":"root-text"}],"tags":["cet4"],"examples":[{"en":"a chemistry text","zh":"化学课本"}],"assoc":{"story":"构词:text(编织) → [计] 文本"}},
{"id":"textile","word":"textile","phonetic":"'tɛkstaɪl","senses":[{"pos":"n","zh":"n.","en":null},{"pos":"n","zh":"纺织品","en":null},{"pos":"adj","zh":"纺织的","en":null}],"breakdown":[{"part":"text","type":"root","zh":"编织","refId":"root-text"},{"part":"ile","type":"suffix","zh":"可…的(形容词)","refId":"affix-ile"}],"tags":["cet4"],"examples":[{"en":"Their main exports are textiles, especially silk and cotton.","zh":"他们的主要出口商品是纺织品，尤其是丝绸和棉布。"}],"assoc":{"story":"构词:text(编织) + ile(可…的(形容词)) → n."}},
];
module.exports = words;
