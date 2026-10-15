export function shuffle(arr, rand = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Builds a round of questions. Kinds rotate between picking the meaning, picking the phrase,
 * and typing the English yourself (the hard one, worth more XP).
 */
export function buildQuestions(phrases, count = 10, rand = Math.random) {
  const picked = shuffle(phrases, rand).slice(0, Math.min(count, phrases.length));
  return picked.map(([phrase, english, roman], i) => {
    const kind = i % 3 === 2 ? 'type' : rand() < 0.5 ? 'toEnglish' : 'fromEnglish';
    const others = shuffle(phrases.filter((p) => p[0] !== phrase), rand).slice(0, 3);
    if (kind === 'fromEnglish') {
      return {
        kind, prompt: english, answer: phrase, roman,
        choices: shuffle([phrase, ...others.map((o) => o[0])], rand),
      };
    }
    return {
      kind, prompt: phrase, roman, answer: english,
      choices: kind === 'type' ? null : shuffle([english, ...others.map((o) => o[1])], rand),
    };
  });
}

export function normalize(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, "'")
    .replace(/\bi'm\b/g, 'i am')
    .replace(/\bdon't\b/g, 'do not')
    .replace(/\bit's\b/g, 'it is')
    .replace(/\bwhat's\b/g, 'what is')
    .replace(/[^\p{L}\p{N}' ]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Levenshtein distance, so one typo doesn't cost you a heart. */
export function distance(a, b) {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

/** Returns 'exact', 'typo' or 'wrong'. */
export function checkTyped(given, expected) {
  const g = normalize(given);
  const e = normalize(expected);
  if (g === e) return 'exact';
  const slack = e.length <= 4 ? 0 : e.length <= 12 ? 1 : 2;
  if (g && distance(g, e) <= slack) return 'typo';
  // "the owl" vs "owl": articles are optional
  const strip = (s) => s.replace(/^(the|a|an) /, '');
  if (strip(g) === strip(e)) return 'exact';
  return 'wrong';
}

export function xpFor(kind, combo) {
  const base = kind === 'type' ? 15 : 10;
  return base + Math.min(combo, 5) * 2;
}
