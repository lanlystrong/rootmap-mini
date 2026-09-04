const { addDaysISO } = require('./date');

function hasAny(log, iso) { const d = log[iso]; return !!(d && (d.new || d.reviews)); }

function streakCompute(log, today) {
  const cursor = hasAny(log, today) ? today : addDaysISO(today, -1);
  if (!hasAny(log, cursor)) return 0;
  let streak = 0;
  for (let d = cursor; hasAny(log, d); d = addDaysISO(d, -1)) streak++;
  return streak;
}

function computeStats(progress, today) {
  const cards = progress.cards || {};
  const entries = Object.values(cards);
  const learned = entries.length;
  const familiar = entries.filter(c => c.srs.reps >= 2).length;
  const dueToday = entries.filter(c => c.srs.dueDate <= today).length;
  const log = progress.log || {};
  const streak = streakCompute(log, today);
  const last14 = [];
  for (let i = 13; i >= 0; i--) {
    const d = addDaysISO(today, -i);
    const l = log[d] || { new: 0, reviews: 0, lapses: 0 };
    last14.push({ date: d, new: l.new || 0, reviews: l.reviews || 0 });
  }
  return { learned, familiar, dueToday, streak, last14 };
}

function familyProgressOf(words, cards) {
  const ids = new Set(words.map(w => w.id));
  let learned = 0, familiar = 0;
  Object.entries(cards).forEach(([id, c]) => {
    if (!ids.has(id)) return;
    learned++;
    if (c.srs.reps >= 2) familiar++;
  });
  return { total: words.length, learned, familiar };
}

module.exports = { computeStats, familyProgressOf, streakCompute };
