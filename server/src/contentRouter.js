const express = require('express');
function contentRouter(content) {
  const r = express.Router();
  r.get('/meta', (req, res) => res.json(content.meta));
  r.get('/roots', (req, res) => res.json(content.roots));
  r.get('/affixes', (req, res) => res.json(content.affixes));
  r.get('/words', (req, res) => res.json(content.words));
  r.get('/words/:id', (req, res) => { const w = content.byWord(req.params.id); if (!w) return res.status(404).json({ error: { code: 'not_found', message: '词不存在' } }); res.json(w); });
  r.get('/roots/:id', (req, res) => { const root = content.byRoot(req.params.id); if (!root) return res.status(404).json({ error: { code: 'not_found', message: '词根不存在' } }); res.json({ root, words: content.rootWords(root.id) }); });
  r.get('/affixes/:id', (req, res) => { const af = content.byAffix(req.params.id); if (!af) return res.status(404).json({ error: { code: 'not_found', message: '词缀不存在' } }); res.json({ affix: af, words: content.affixWords(af.id) }); });
  return r;
}
module.exports = { contentRouter };
