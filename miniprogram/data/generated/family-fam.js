// 由 server/scripts/generate-content.js 生成,请勿手改;手写内容见 ../roots.js ../affixes.js ../families/
// 输入指纹: 手写层 fe2415b761e473caa0cf4ef61ff4ab5bfb42dd83 / 产物 1f39f69c0e154fbdcf50aaad410584b5524fdc8e
const words = [
{"id":"fame","word":"fame","phonetic":"fem","senses":[{"pos":"n","zh":"名声，名望","en":null}],"breakdown":[{"part":"fam","type":"root","zh":"说/名声","refId":"root-fam"},{"part":"e","type":"none"}],"tags":["cet4","高频"],"examples":[{"en":"He claims he is not really interested in fame.","zh":"他称自己对出名真的没有兴趣。"}],"assoc":{"story":"构词:fam(说/名声) → 名声"}},
{"id":"famous","word":"famous","phonetic":"'feməs","senses":[{"pos":"adj","zh":"著名的，出名的","en":null}],"breakdown":[{"part":"fam","type":"root","zh":"说/名声","refId":"root-fam"},{"part":"ous","type":"suffix","zh":"充满…的(形容词)","refId":"affix-ous"}],"tags":["cet4","高频"],"examples":[{"en":"a famous actor","zh":"著名演员"},{"en":"Many famous people have stayed in the hotel.","zh":"许多名人都曾下榻这家酒店。"}],"assoc":{"story":"构词:fam(说/名声) + ous(充满…的(形容词)) → 著名的"}},
{"id":"infant","word":"infant","phonetic":"'ɪnfənt","senses":[{"pos":"n","zh":"婴儿","en":null},{"pos":"adj","zh":"婴儿的","en":null}],"breakdown":[{"part":"in","type":"prefix","zh":"不/非;向内","refId":"affix-in"},{"part":"fant","type":"root","zh":"说/名声","refId":"root-fam"}],"tags":["cet4"],"examples":[{"en":"An infant’s skin is very sensitive.","zh":"幼儿的皮肤非常敏感。"}],"assoc":{"story":"构词:in(不/非;向内) + fant(说/名声) → 婴儿"}},
];
module.exports = words;
