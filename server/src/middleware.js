const notFound = (req, res) => res.status(404).json({ error: { code: 'not_found', message: '路由不存在' } });
const errorHandler = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: { code: 'bad_json', message: 'JSON 解析失败' } });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: { code: 'payload_too_large', message: '请求体过大' } });
  console.error(err);
  res.status(500).json({ error: { code: 'internal', message: '服务器内部错误' } });
};
module.exports = { notFound, errorHandler };
