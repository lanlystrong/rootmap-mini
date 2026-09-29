// 由 server/scripts/generate-content.js 生成,请勿手改;手写内容见 ../roots.js ../affixes.js ../families/
// 输入指纹: 手写层 465c3c8fb5eb3a1f627f57ee19a89c14ca931b80 / 产物 26d51f6b8add60535535a5fffc75dbb5089db90e
const words = [
{"id":"journal","word":"journal","phonetic":"'dʒɝnl","senses":[{"pos":"n","zh":"日报，杂志；日志","en":null}],"breakdown":[{"part":"journ","type":"root","zh":"日","refId":"root-journ"},{"part":"al","type":"suffix","zh":"…的(形容词)/名词","refId":"affix-al"}],"tags":["cet4"],"examples":[{"en":"the British Medical Journal","zh":"《英国医学杂志》"}],"assoc":{"story":"构词:journ(日) + al(…的(形容词)/名词) → 日报"}},
{"id":"journey","word":"journey","phonetic":"'dʒɝni","senses":[{"pos":"n","zh":"旅行，旅程","en":null},{"pos":"n","zh":"旅行","en":null}],"breakdown":[{"part":"journ","type":"root","zh":"日","refId":"root-journ"},{"part":"e","type":"none"},{"part":"y","type":"suffix","zh":"名词后缀","refId":"affix-y"}],"tags":["cet4"],"examples":[{"en":"the friends they made on the journey","zh":"他们在旅途中交下的朋友"}],"assoc":{"story":"构词:journ(日) + y(名词后缀) → 旅行"}},
{"id":"journalist","word":"journalist","phonetic":"'dʒɝnəlɪst","senses":[{"pos":"n","zh":"记者，新闻工作者","en":null}],"breakdown":[{"part":"journal","type":"root","zh":"日","refId":"root-journ"},{"part":"ist","type":"suffix","zh":"…者(名词)","refId":"affix-ist"}],"tags":["cet4"],"examples":[{"en":"a well-known journalist and broadcaster","zh":"一位著名的新闻记者兼播音员"}],"assoc":{"story":"构词:journal(日) + ist(…者(名词)) → 记者"}},
];
module.exports = words;
