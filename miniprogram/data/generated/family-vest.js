// 由 server/scripts/generate-content.js 生成,请勿手改;手写内容见 ../roots.js ../affixes.js ../families/
// 输入指纹: 手写层 465c3c8fb5eb3a1f627f57ee19a89c14ca931b80 / 产物 26d51f6b8add60535535a5fffc75dbb5089db90e
const words = [
{"id":"invest","word":"invest","phonetic":"ɪn'vɛst","senses":[{"pos":"v","zh":"投资","en":null}],"breakdown":[{"part":"in","type":"prefix","zh":"不/非;向内","refId":"affix-in"},{"part":"vest","type":"root","zh":"衣/授予","refId":"root-vest"}],"tags":["cet4","高频"],"examples":[{"en":"I’ve got a few thousand dollars I’m looking to invest.","zh":"我有几千美元想作投资。"}],"assoc":{"story":"构词:in(不/非;向内) + vest(衣/授予) → 投资"}},
{"id":"vest","word":"vest","phonetic":"vest","senses":[{"pos":"n","zh":"背心；汗衫","en":null},{"pos":"v","zh":"授予；使穿衣","en":null}],"breakdown":[{"part":"vest","type":"root","zh":"衣/授予","refId":"root-vest"}],"tags":["cet4"],"examples":[{"en":"a bulletproof vest","zh":"防弹背心"}],"assoc":{"story":"构词:vest(衣/授予) → 背心"}},
{"id":"investment","word":"investment","phonetic":"ɪn'vɛstmənt","senses":[{"pos":"n","zh":"投资，投资额，投入","en":null}],"breakdown":[{"part":"in","type":"prefix","zh":"不/非;向内","refId":"affix-in"},{"part":"vest","type":"root","zh":"衣/授予","refId":"root-vest"},{"part":"ment","type":"suffix","zh":"名词后缀(表行为/结果)","refId":"affix-ment"}],"tags":["cet4"],"examples":[{"en":"We plan to buy some property as an investment.","zh":"我们打算买些房地产作为投资。"}],"assoc":{"story":"构词:in(不/非;向内) + vest(衣/授予) + ment(名词后缀(表行为/结果)) → 投资"}},
];
module.exports = words;
