// 由 server/scripts/generate-content.js 生成,请勿手改;手写内容见 ../roots.js ../affixes.js ../families/
// 输入指纹: 手写层 fe2415b761e473caa0cf4ef61ff4ab5bfb42dd83 / 产物 1f39f69c0e154fbdcf50aaad410584b5524fdc8e
const words = [
{"id":"suburb","word":"suburb","phonetic":"'sʌbɝb","senses":[{"pos":"n","zh":"郊区， 郊外， 近郊","en":null}],"breakdown":[{"part":"sub","type":"prefix","zh":"在下/次级/接近","refId":"affix-sub"},{"part":"urb","type":"root","zh":"城市","refId":"root-urb"}],"tags":["cet4","高频"],"examples":[{"en":"a London suburb","zh":"一个伦敦郊区"},{"en":"a kid from the suburbs","zh":"来自郊区的小孩子"}],"assoc":{"story":"构词:sub(在下/次级/接近) + urb(城市) → 郊区"}},
{"id":"urban","word":"urban","phonetic":"'ɝbən","senses":[{"pos":"adj","zh":"a.","en":null},{"pos":"adj","zh":"都市的,住在都市的","en":null}],"breakdown":[{"part":"urb","type":"root","zh":"城市","refId":"root-urb"},{"part":"an","type":"suffix","zh":"…的/…人(形容词/名词)","refId":"affix-an-suffix"}],"tags":["cet4"],"examples":[{"en":"unemployment in urban areas","zh":"城市地区的失业状况"},{"en":"the deprived sections of the urban population","zh":"城市人口中的贫困群体"}],"assoc":{"story":"构词:urb(城市) + an(…的/…人(形容词/名词)) → a."}},
];
module.exports = words;
