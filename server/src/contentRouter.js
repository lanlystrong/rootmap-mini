// server/src/contentRouter.js
const express = require('express');

// 内容路由
function contentRouter(content) {
  const router = express.Router();

  // 获取内容元数据
  router.get('/meta', (req, res) => {
    res.json(content.meta);
  });

  // 获取所有词根
  router.get('/roots', (req, res) => {
    res.json(content.roots);
  });

  // 获取所有词缀
  router.get('/affixes', (req, res) => {
    res.json(content.affixes);
  });

  // 获取所有单词
  router.get('/words', (req, res) => {
    res.json(content.words);
  });

  // 获取单个单词详情
  router.get('/words/:id', (req, res) => {
    const word = content.byWord(req.params.id);
    if (!word) {
      return res.status(404).json({
        error: {
          code: 'word_not_found',
          message: '词不存在'
        }
      });
    }
    res.json(word);
  });

  // 获取词根详情及关联单词
  router.get('/roots/:id', (req, res) => {
    const root = content.byRoot(req.params.id);
    if (!root) {
      return res.status(404).json({
        error: {
          code: 'root_not_found',
          message: '词根不存在'
        }
      });
    }

    // 获取关联单词
    const words = content.rootWords(root.id);

    // 获取用户对这些词根的学习进度（可选，需要认证）
    const userProgress = null; // 这里可以添加获取用户进度的逻辑

    res.json({
      root: root,
      words: words,
      wordCount: words.length,
      progress: userProgress
    });
  });

  // 获取词缀详情及关联单词
  router.get('/affixes/:id', (req, res) => {
    const affix = content.byAffix(req.params.id);
    if (!affix) {
      return res.status(404).json({
        error: {
          code: 'affix_not_found',
          message: '词缀不存在'
        }
      });
    }

    // 获取关联单词
    const words = content.affixWords(affix.id);

    // 获取用户对这些词缀的学习进度（可选，需要认证）
    const userProgress = null; // 这里可以添加获取用户进度的逻辑

    res.json({
      affix: affix,
      words: words,
      wordCount: words.length,
      progress: userProgress
    });
  });

  // 搜索词根和单词
  router.get('/search', (req, res) => {
    const { q, mode = 'root' } = req.query;

    if (!q || q.trim() === '') {
      return res.json({
        roots: [],
        words: []
      });
    }

    const query = q.toLowerCase().trim();
    const roots = [];
    const words = [];

    // 搜索词根
    if (mode === 'root' || mode === 'all') {
      content.roots.forEach(root => {
        if (root.root.toLowerCase().includes(query) ||
            root.zh.toLowerCase().includes(query)) {
          // 获取词根下的单词
          const rootWords = content.rootWords(root.id);
          roots.push({
            ...root,
            variants: rootWords.map(w => w.word).slice(0, 5) // 显示前5个变体
          });
        }
      });
    }

    // 搜索单词
    if (mode === 'word' || mode === 'all') {
      content.words.forEach(word => {
        // 中文释义在 senses[] 里,词条本身没有顶层 zh —— 早期写成 word.zh.toLowerCase()
        // 会让「没被英文部分命中」的查询直接抛 500(undefined.toLowerCase)。
        const zh = (word.senses || []).map(s => s.zh || '').join(' ');
        if (word.word.toLowerCase().includes(query) ||
            zh.toLowerCase().includes(query)) {
          words.push({
            ...word,
            phonetic: word.phonetic || '/ˈwɜːrd/' // 默认音标
          });
        }
      });
    }

    // 限制结果数量
    const resultLimit = 20;
    res.json({
      roots: roots.slice(0, resultLimit),
      words: words.slice(0, resultLimit)
    });
  });

  // 获取词根分组
  router.get('/groups', (req, res) => {
    // 将词根按首字母分组
    const groups = {};

    content.roots.forEach(root => {
      const firstChar = root.root.charAt(0).toUpperCase();
      if (!groups[firstChar]) {
        groups[firstChar] = [];
      }

      groups[firstChar].push({
        id: root.id,
        root: root.root,
        zh: root.zh
      });
    });

    // 转换为数组格式
    const groupArray = Object.keys(groups).sort().map(key => ({
      key: key,
      label: key,
      items: groups[key].sort((a, b) => a.root.localeCompare(b.root))
    }));

    res.json(groupArray);
  });

  // 获取词缀分类
  router.get('/affix-types', (req, res) => {
    // 将词按类型分组
    const types = {
      'prefix': { label: '前缀', items: [] },
      'suffix': { label: '后缀', items: [] },
      'infix': { label: '中缀', items: [] },
      'circumfix': { label: '前后缀', items: [] }
    };

    content.affixes.forEach(affix => {
      if (types[affix.type]) {
        types[affix.type].items.push({
          id: affix.id,
          affix: affix.affix,
          zh: affix.zh
        });
      }
    });

    // 只返回有内容的类型
    const result = Object.keys(types)
      .filter(type => types[type].items.length > 0)
      .map(type => ({
        type: type,
        label: types[type].label,
        items: types[type].items.sort((a, b) => a.affix.localeCompare(b.affix))
      }));

    res.json(result);
  });

  // 获取推荐词根（按难度或热度）
  router.get('/recommended', (req, res) => {
    const { limit = 10, type = 'popular' } = req.query;

    // 这里可以实现不同的推荐策略
    // 例如：popular（热门）、basic（基础）、advanced（进阶）
    let recommended = [];

    switch (type) {
      case 'popular':
        // 按关联单词数量排序。必须复制后再排 —— content.roots 是 loadContent() 返回的
        // 共享数组,sort() 是原地排序,会把「按热度」的顺序泄漏到之后所有 /roots 响应上,
        // 用户看到的词根地图顺序会随请求历史变化。
        recommended = [...content.roots]
          .sort((a, b) => content.rootWords(b.id).length - content.rootWords(a.id).length)
          .slice(0, limit);
        break;

      case 'basic':
        // 基础词根（简单的几个字母）
        recommended = content.roots
          .filter(root => root.root.length <= 3)
          .slice(0, limit);
        break;

      case 'advanced':
        // 进阶词根（较长的或复杂的意思）
        recommended = content.roots
          .filter(root => root.root.length > 4)
          .slice(0, limit);
        break;

      default:
        // 默认返回前10个
        recommended = content.roots.slice(0, limit);
    }

    res.json(recommended);
  });

  // 获取词根家族
  router.get('/families/:rootId', (req, res) => {
    const { rootId } = req.params;
    const root = content.byRoot(rootId);

    if (!root) {
      return res.status(404).json({
        error: {
          code: 'root_not_found',
          message: '词根不存在'
        }
      });
    }

    // 获取所有相关单词
    const words = content.rootWords(rootId);

    // 按词性分组
    const byPos = {
      noun: [],
      verb: [],
      adjective: [],
      adverb: [],
      other: []
    };

    words.forEach(word => {
      if (word.pos) {
        if (byPos[word.pos]) {
          byPos[word.pos].push(word);
        } else {
          byPos.other.push(word);
        }
      } else {
        byPos.other.push(word);
      }
    });

    // 构建家族树
    const family = {
      root: root,
      words: words,
      totalWords: words.length,
      byPos: Object.keys(byPos).map(pos => ({
        pos: pos,
        label: pos === 'noun' ? '名词' :
               pos === 'verb' ? '动词' :
               pos === 'adjective' ? '形容词' :
               pos === 'adverb' ? '副词' : '其他',
        count: byPos[pos].length,
        words: byPos[pos]
      }))
    };

    res.json(family);
  });

  // 获取数据校验和
  router.get('/checksum', (req, res) => {
    res.json({
      checksum: content.meta.checksum,
      version: content.meta.version,
      counts: content.meta.counts,
      lastUpdated: new Date().toISOString()
    });
  });

  return router;
}

module.exports = { contentRouter };