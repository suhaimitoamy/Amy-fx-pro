(function (root) {
  'use strict';

  function shuffle(items, random) {
    var result = Array.isArray(items) ? items.slice() : [];
    random = random || Math.random;
    for (var i = result.length - 1; i > 0; i--) {
      var j = Math.floor(random() * (i + 1));
      var value = result[i];
      result[i] = result[j];
      result[j] = value;
    }
    return result;
  }

  function select(bank, difficulty, count, seen, random, options) {
    options = options || {};
    var topic = options.topic || 'ALL';
    var mistakesOnly = Boolean(options.mistakesOnly);
    var masteryMap = options.masteryMap || {};
    var seenList = Array.isArray(seen) ? seen : [];

    var eligible = (Array.isArray(bank) ? bank : []).filter(function (q) {
      var diffOk = !difficulty || difficulty === 'ALL' || q.difficulty === difficulty;
      var topicOk = !topic || topic === 'ALL' || q.topic === topic;
      if (!diffOk || !topicOk) return false;
      if (mistakesOnly) {
        var rec = masteryMap[q.id];
        return Boolean(rec && rec.lastCorrect === false);
      }
      return true;
    });

    // Prioritize previously missed questions, then unseen, then already mastered
    var missed = shuffle(eligible.filter(function (q) {
      var rec = masteryMap[q.id];
      return Boolean(rec && rec.lastCorrect === false);
    }), random);
    var missedIds = new Set(missed.map(function (q) { return q.id; }));

    var unseen = shuffle(eligible.filter(function (q) {
      return !missedIds.has(q.id) && !seenList.includes(q.id);
    }), random);
    var unseenIds = new Set(unseen.map(function (q) { return q.id; }));

    var mastered = shuffle(eligible.filter(function (q) {
      return !missedIds.has(q.id) && !unseenIds.has(q.id);
    }), random);

    var limit = Math.min(Number(count) || 10, eligible.length);
    return missed.concat(unseen).concat(mastered).slice(0, limit);
  }

  function computePillarMastery(bank, masteryMap) {
    var map = masteryMap || {};
    var groups = {};
    (Array.isArray(bank) ? bank : []).forEach(function (q) {
      if (!groups[q.topic]) {
        groups[q.topic] = {
          topic: q.topic,
          category: q.category || q.topic,
          total: 0,
          attempted: 0,
          mastered: 0,
          mistakes: 0
        };
      }
      var g = groups[q.topic];
      g.total += 1;
      var rec = map[q.id];
      if (rec && Number(rec.attempts) > 0) {
        g.attempted += 1;
        if (rec.lastCorrect) g.mastered += 1;
        else g.mistakes += 1;
      }
    });
    return Object.values(groups).map(function (g) {
      g.pct = g.total ? Math.round((g.mastered / g.total) * 100) : 0;
      return g;
    });
  }

  function summary(results) {
    var topics = {};
    (Array.isArray(results) ? results : []).forEach(function (r) {
      if (r.correct) return;
      var key = r.exercise.topic;
      if (!topics[key]) {
        topics[key] = {
          topic: key,
          category: r.exercise.category || key,
          lesson: r.exercise.lesson,
          mistakes: []
        };
      }
      topics[key].mistakes.push(r);
    });
    var list = Array.isArray(results) ? results : [];
    return {
      total: list.length,
      correct: list.filter(function (r) { return r.correct; }).length,
      wrongIds: list.filter(function (r) { return !r.correct; }).map(function (r) { return r.exercise.id; }),
      topics: Object.values(topics)
    };
  }

  root.AmyGuidedSession = {
    shuffle: shuffle,
    select: select,
    summary: summary,
    computePillarMastery: computePillarMastery
  };
})(typeof window === 'undefined' ? globalThis : window);
