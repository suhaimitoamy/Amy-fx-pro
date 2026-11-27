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

  function parseGuidedUrlParams(searchStr, validTopics) {
    var result = { topic: null, difficulty: null, mode: null, fromLesson: null, count: null };
    if (!searchStr || typeof searchStr !== 'string') return result;
    var query = searchStr.charAt(0) === '?' ? searchStr.slice(1) : searchStr;
    if (!query) return result;
    var params;
    try {
      params = new URLSearchParams(query);
    } catch (_) {
      return result;
    }
    var topicSet = Array.isArray(validTopics) && validTopics.length ? new Set(validTopics) : null;
    var rawTopic = String(params.get('topic') || '').trim();
    if (rawTopic && (!topicSet || topicSet.has(rawTopic))) {
      result.topic = rawTopic;
    }
    var rawDiff = String(params.get('difficulty') || '').trim().toLowerCase();
    if (rawDiff === 'mudah' || rawDiff === 'sedang' || rawDiff === 'advanced') {
      result.difficulty = rawDiff;
    }
    var rawMode = String(params.get('mode') || '').trim().toLowerCase();
    if (rawMode === 'mistakes') {
      result.mode = 'mistakes';
    }
    var rawLesson = String(params.get('fromLesson') || '').trim();
    if (rawLesson && /^[a-z0-9-]+$/i.test(rawLesson)) {
      result.fromLesson = rawLesson;
    }
    var rawCount = Number(params.get('count'));
    if ([10, 20, 30, 50, 100].includes(rawCount)) {
      result.count = rawCount;
    }
    return result;
  }

  root.AmyGuidedSession = {
    shuffle: shuffle,
    select: select,
    summary: summary,
    computePillarMastery: computePillarMastery,
    parseGuidedUrlParams: parseGuidedUrlParams
  };
})(typeof window === 'undefined' ? globalThis : window);
