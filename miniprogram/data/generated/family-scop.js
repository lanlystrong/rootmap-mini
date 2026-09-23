// 由 server/scripts/generate-content.js 生成,请勿手改;手写内容见 ../roots.js ../affixes.js ../families/
// 输入指纹: 手写层 fe2415b761e473caa0cf4ef61ff4ab5bfb42dd83 / 产物 1f39f69c0e154fbdcf50aaad410584b5524fdc8e
const words = [
{"id":"scope","word":"scope","phonetic":"skop","senses":[{"pos":"n","zh":"范围","en":null}],"breakdown":[{"part":"scop","type":"root","zh":"看/镜","refId":"root-scop"},{"part":"e","type":"none"}],"tags":["cet4","高频"],"examples":[{"en":"measures to limit the scope of criminals’ activities","zh":"限制罪犯活动范围的措施"}],"assoc":{"story":"构词:scop(看/镜) → 范围"}},
{"id":"telescope","word":"telescope","phonetic":"'tɛlɪskop","senses":[{"pos":"v","zh":"压缩；使套叠","en":null},{"pos":"n","zh":"望远镜；缩叠式旅行袋","en":null}],"breakdown":[{"part":"tele","type":"prefix","zh":"远/远距离","refId":"affix-tele"},{"part":"scope","type":"root","zh":"看/镜","refId":"root-scop"}],"tags":["cet4"],"examples":[{"en":"The front of the car telescoped when it hit the wall.","zh":"汽车撞在墙上，车头都撞瘪了。"}],"assoc":{"story":"构词:tele(远/远距离) + scope(看/镜) → 压缩"}},
{"id":"microscope","word":"microscope","phonetic":"'maɪkrəskop","senses":[{"pos":"n","zh":"显微镜","en":null}],"breakdown":[{"part":"micro","type":"prefix","zh":"微小","refId":"affix-micro"},{"part":"scope","type":"root","zh":"看/镜","refId":"root-scop"}],"tags":["cet4"],"examples":[{"en":"The slightest movement will defocus the microscope.","zh":"最轻微的运动都会使显微镜散焦。"},{"en":"The microscope magnified the object two hundred times.","zh":"这架显微镜把实物放大了200倍。"}],"assoc":{"story":"构词:micro(微小) + scope(看/镜) → 显微镜"}},
];
module.exports = words;
