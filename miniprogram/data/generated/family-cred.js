// 由 server/scripts/generate-content.js 生成,请勿手改;手写内容见 ../roots.js ../affixes.js ../families/
// 输入指纹: 手写层 fe2415b761e473caa0cf4ef61ff4ab5bfb42dd83 / 产物 1f39f69c0e154fbdcf50aaad410584b5524fdc8e
const words = [
{"id":"credit","word":"credit","phonetic":"'krɛdɪt","senses":[{"pos":"n","zh":"信贷，赊欠；赞扬，荣誉；学分；信任","en":null},{"pos":"vt","zh":"相信； 把…记入贷方； 把…归于","en":null}],"breakdown":[{"part":"cred","type":"root","zh":"相信","refId":"root-cred"},{"part":"it","type":"none"}],"tags":["cet4","高频"],"examples":[{"en":"The store agreed to let him have credit.","zh":"商店同意他赊购。"},{"en":"What’s the credit limit on your Visa card?","zh":"你的维萨卡信用额度是多少？"}],"assoc":{"story":"构词:cred(相信) → 信贷"}},
{"id":"incredible","word":"incredible","phonetic":"ɪn'krɛdəbl","senses":[{"pos":"adj","zh":"不可思议的","en":null}],"breakdown":[{"part":"in","type":"prefix","zh":"不/非;向内","refId":"affix-in"},{"part":"cred","type":"root","zh":"相信","refId":"root-cred"},{"part":"ible","type":"suffix","zh":"可…的(形容词)","refId":"affix-ible"}],"tags":["cet4","高频"],"examples":[{"en":"It’s incredible that he survived the fall.","zh":"他跌下去竟然能够生还，真不可思议。"},{"en":"It’s incredible how much Tom has changed since he met Sally.","zh":"自从遇见萨莉后，汤姆的变化之大简直令人难以置信。"}],"assoc":{"story":"构词:in(不/非;向内) + cred(相信) + ible(可…的(形容词)) → 不可思议的"}},
];
module.exports = words;
