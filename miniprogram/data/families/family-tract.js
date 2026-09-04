const words = [
  { id: 'attract', word: 'attract', phonetic: '/əˈtrækt/',
    senses: [{ pos: 'v.', zh: '吸引;引起', en: 'to make someone interested in or drawn to something' }],
    breakdown: [
      { part: 'at', type: 'prefix', zh: '朝向', refId: 'affix-ad' },
      { part: 'tract', type: 'root', zh: '拉', refId: 'root-tract' },
    ],
    tags: ['cet4', '高频'],
    examples: [
      { en: 'The show attracted thousands of visitors.', zh: '这场演出吸引了成千上万的游客。' },
      { en: 'Bright colors attract children.', zh: '鲜艳的颜色吸引孩子。' },
    ],
    assoc: { antonyms: ['distract'],
      story: 'at(ad- 的变体,朝向)+tract(拉)= 拉到身边来 → 吸引。' } },
  { id: 'distract', word: 'distract', phonetic: '/dɪˈstrækt/',
    senses: [{ pos: 'v.', zh: '使分心;转移(注意力)', en: 'to take someone’s attention away from what they are doing' }],
    breakdown: [
      { part: 'dis', type: 'prefix', zh: '分开', refId: 'affix-dis' },
      { part: 'tract', type: 'root', zh: '拉', refId: 'root-tract' },
    ],
    tags: ['cet4'],
    examples: [
      { en: 'Don’t distract me while I’m studying.', zh: '我学习时别让我分心。' },
      { en: 'The noise distracted the players.', zh: '噪音分散了选手们的注意力。' },
    ],
    assoc: { antonyms: ['attract'],
      story: 'dis(分开)+tract(拉)= 把注意力拉开 → 使分心。' } },
  { id: 'contract', word: 'contract', phonetic: '/ˈkɒntrækt/',
    senses: [{ pos: 'n.', zh: '合同;契约', en: 'a legal written agreement between people or groups' }],
    breakdown: [
      { part: 'con', type: 'prefix', zh: '共同', refId: 'affix-con' },
      { part: 'tract', type: 'root', zh: '拉', refId: 'root-tract' },
    ],
    tags: ['cet4', '高频'],
    examples: [
      { en: 'He signed a two-year contract with the club.', zh: '他和俱乐部签了一份为期两年的合同。' },
      { en: 'Read the contract carefully before you sign it.', zh: '签字前要仔细阅读合同。' },
    ],
    assoc: { story: 'con(共同)+tract(拉)= 把双方拉到一起的约定 → 合同。' } },
  { id: 'extract', word: 'extract', phonetic: '/ɪkˈstrækt/',
    senses: [{ pos: 'v.', zh: '提取;提炼', en: 'to take something out by a process' },
             { pos: 'v.', zh: '拔出;摘录', en: 'to remove something from a place; to take a passage from a text' }],
    breakdown: [
      { part: 'ex', type: 'prefix', zh: '向外', refId: 'affix-ex' },
      { part: 'tract', type: 'root', zh: '拉', refId: 'root-tract' },
    ],
    tags: ['cet6'],
    examples: [
      { en: 'The oil is extracted from these seeds.', zh: '这种油是从这些种子里提取的。' },
      { en: 'The dentist extracted my bad tooth.', zh: '牙医拔掉了我的坏牙。' },
    ],
    assoc: { story: 'ex(向外)+tract(拉)= 拉出来 → 提取、拔出。' } },
  { id: 'subtract', word: 'subtract', phonetic: '/səbˈtrækt/',
    senses: [{ pos: 'v.', zh: '减去;扣除', en: 'to take a number or an amount away from another' }],
    breakdown: [
      { part: 'sub', type: 'prefix', zh: '向下/取走', refId: 'affix-sub' },
      { part: 'tract', type: 'root', zh: '拉', refId: 'root-tract' },
    ],
    tags: ['cet4'],
    examples: [
      { en: 'Subtract 3 from 9 and you get 6.', zh: '9 减 3 等于 6。' },
      { en: 'Please subtract the cost of the meal from the total.', zh: '请从总额中扣除餐费。' },
    ],
    assoc: { story: 'sub(在下)+tract(拉)= 从下面抽走 → 减去。' } },
  { id: 'tractor', word: 'tractor', phonetic: '/ˈtræktə/',
    senses: [{ pos: 'n.', zh: '拖拉机;牵引机', en: 'a strong vehicle used on farms to pull machinery' }],
    breakdown: [
      { part: 'tract', type: 'root', zh: '拉', refId: 'root-tract' },
      { part: 'or', type: 'suffix', zh: '…的机器', refId: 'affix-or' },
    ],
    tags: ['cet4'],
    examples: [
      { en: 'The farmer drives a tractor.', zh: '农夫开着拖拉机。' },
      { en: 'Tractors are widely used in modern farming.', zh: '拖拉机在现代农业中广泛使用。' },
    ],
    assoc: { story: 'tract(拉)+or(…的机器)= 用来拉东西的车 → 拖拉机。' } },
];
module.exports = words;
