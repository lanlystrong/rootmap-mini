// 由 server/scripts/generate-content.js 生成,请勿手改;手写内容见 ../roots.js ../affixes.js ../families/
// 输入指纹: 手写层 fe2415b761e473caa0cf4ef61ff4ab5bfb42dd83 / 产物 1f39f69c0e154fbdcf50aaad410584b5524fdc8e
const words = [
{"id":"clinic","word":"clinic","phonetic":"'klɪnɪk","senses":[{"pos":"n","zh":"诊所","en":null}],"breakdown":[{"part":"clin","type":"root","zh":"倾斜","refId":"root-clin"},{"part":"ic","type":"suffix","zh":"…的/…学(名词/形容词)","refId":"affix-ic"}],"tags":["cet4","高频"],"examples":[{"en":"an appointment at an outpatient clinic","zh":"门诊预约"}],"assoc":{"story":"构词:clin(倾斜) + ic(…的/…学(名词/形容词)) → 诊所"}},
{"id":"decline","word":"decline","phonetic":"dɪ'klaɪn","senses":[{"pos":"v","zh":"下降， 减少； 衰退， 衰落； 谢绝， 拒绝","en":null},{"pos":"n","zh":"下降，减少；衰退","en":null}],"breakdown":[{"part":"de","type":"prefix","zh":"向下/去除/加强","refId":"affix-de"},{"part":"clin","type":"root","zh":"倾斜","refId":"root-clin"},{"part":"e","type":"none"}],"tags":["cet4","高频"],"examples":[{"en":"Spending on information technology has declined.","zh":"用于信息技术的支出减少了。"},{"en":"Car sales have declined by a quarter.","zh":"汽车销量下滑了四分之一。"}],"assoc":{"story":"构词:de(向下/去除/加强) + clin(倾斜) → 下降"}},
{"id":"incline","word":"incline","phonetic":"ɪn'klaɪn","senses":[{"pos":"n","zh":"斜坡","en":null},{"pos":"v","zh":"使倾斜","en":null}],"breakdown":[{"part":"in","type":"prefix","zh":"不/非;向内","refId":"affix-in"},{"part":"clin","type":"root","zh":"倾斜","refId":"root-clin"},{"part":"e","type":"none"}],"tags":["cet4"],"examples":[{"en":"a steep incline","zh":"陡坡"}],"assoc":{"story":"构词:in(不/非;向内) + clin(倾斜) → 斜坡"}},
];
module.exports = words;
