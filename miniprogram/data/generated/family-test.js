// 由 server/scripts/generate-content.js 生成,请勿手改;手写内容见 ../roots.js ../affixes.js ../families/
// 输入指纹: 手写层 465c3c8fb5eb3a1f627f57ee19a89c14ca931b80 / 产物 26d51f6b8add60535535a5fffc75dbb5089db90e
const words = [
{"id":"protest","word":"protest","phonetic":"prəˈtɛst","senses":[{"pos":"v","zh":"抗议， 反对","en":null},{"pos":"n","zh":"抗议， 反对","en":null}],"breakdown":[{"part":"pro","type":"prefix","zh":"向前/预先","refId":"affix-pro"},{"part":"test","type":"root","zh":"作证","refId":"root-test"}],"tags":["cet4","高频"],"examples":[{"en":"‘I don’t see why I should take the blame for this!’ she protested.","zh":"“我不明白为什么我要对此承担责任！”她抗议道。"}],"assoc":{"story":"构词:pro(向前/预先) + test(作证) → 抗议"}},
{"id":"test","word":"test","phonetic":"tɛst","senses":[{"pos":"n","zh":"试验；检验","en":null},{"pos":"v","zh":"试验；测试","en":null}],"breakdown":[{"part":"test","type":"root","zh":"作证","refId":"root-test"}],"tags":["cet4"],"examples":[{"en":"Did you get a good mark in the test?","zh":"你这次测验成绩好吗？"}],"assoc":{"story":"构词:test(作证) → 试验"}},
{"id":"contest","word":"contest","phonetic":"kən'tɛst","senses":[{"pos":"n","zh":"竞赛， 争夺","en":null},{"pos":"vt","zh":"争夺， 与…竞争； 对…提出质疑， 辩驳","en":null}],"breakdown":[{"part":"con","type":"prefix","zh":"共同/加强","refId":"affix-con"},{"part":"test","type":"root","zh":"作证","refId":"root-test"}],"tags":["cet4"],"examples":[{"en":"Stone decided to hold a contest to see who could write the best song.","zh":"斯通决定举行一场比赛，看谁能够写出最佳歌曲。"},{"en":"I only entered the contest for fun.","zh":"我只是为了好玩才参加这次比赛的。"}],"assoc":{"story":"构词:con(共同/加强) + test(作证) → 竞赛"}},
];
module.exports = words;
