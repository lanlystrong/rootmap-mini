const express = require('express');
const { createDb } = require('./db');
const { loadContent } = require('./content');
const { contentRouter } = require('./contentRouter');
const { authRouter, authRequired } = require('./authRouter');
const { eventsRouter } = require('./eventsRouter');
const { statsRouter } = require('./statsRouter');
const { notFound, errorHandler } = require('./middleware');

function createApp({ dbPath = ':memory:' } = {}) {
  const db = createDb(dbPath);
  const content = loadContent();
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/content', contentRouter(content));
  app.use('/api/auth', authRouter(db));
  app.use('/api/events', authRequired(db), eventsRouter(db, content));
  app.use('/api/stats', authRequired(db), statsRouter(db, content));
  // 后续任务各自动挂载:/api/stats(Task 4)
  app.use(notFound);
  app.use(errorHandler);
  return { app, db, content };
}
module.exports = { createApp };
