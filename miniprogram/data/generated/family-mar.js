// 由 server/scripts/generate-content.js 生成,请勿手改;手写内容见 ../roots.js ../affixes.js ../families/
// 输入指纹: 手写层 465c3c8fb5eb3a1f627f57ee19a89c14ca931b80 / 产物 26d51f6b8add60535535a5fffc75dbb5089db90e
const words = [
{"id":"marine","word":"marine","phonetic":"mə'rin","senses":[{"pos":"adj","zh":"海的， 海生的； 海事的， 海军的， 海运的","en":null},{"pos":"n","zh":"海军陆战队士兵","en":null}],"breakdown":[{"part":"marin","type":"root","zh":"海","refId":"root-mar"},{"part":"e","type":"none"}],"tags":["cet4","高频"],"examples":[{"en":"the enormous variety of marine life","zh":"海洋生物繁多的种类"},{"en":"the effects of oil pollution on marine mammals","zh":"石油污染对海洋哺乳动物的影响"}],"assoc":{"story":"构词:marin(海) → 海的"}},
{"id":"submarine","word":"submarine","phonetic":"sʌbmə'rin","senses":[{"pos":"adj","zh":"水下的","en":null},{"pos":"n","zh":"潜水艇","en":null}],"breakdown":[{"part":"sub","type":"prefix","zh":"在下/次级/接近","refId":"affix-sub"},{"part":"marin","type":"root","zh":"海","refId":"root-mar"},{"part":"e","type":"none"}],"tags":["cet4"],"examples":[{"en":"The captain dived his submarine deep to escape from the destroyers.","zh":"海军上校使他的潜艇深深下潜以逃避驱逐艇。"}],"assoc":{"story":"构词:sub(在下/次级/接近) + marin(海) → 水下的"}},
];
module.exports = words;
