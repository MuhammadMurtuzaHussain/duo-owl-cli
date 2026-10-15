import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildQuestions, checkTyped, xpFor } from '../src/quiz/engine.js';
import { PACKS, packFor } from '../src/quiz/packs.js';
import { nagMessage } from '../src/commands/nag.js';

test('every pack has enough phrases for a 10 question round with 4 choices', () => {
  for (const [code, pack] of Object.entries(PACKS)) {
    assert.ok(pack.phrases.length >= 10, `${code} is too small`);
    const qs = buildQuestions(pack.phrases, 10);
    assert.equal(qs.length, 10);
    for (const q of qs) {
      if (q.choices) {
        assert.equal(q.choices.length, 4);
        assert.ok(q.choices.includes(q.answer));
        assert.equal(new Set(q.choices).size, 4, `duplicate choices in ${code}`);
      }
    }
  }
});

test('typed answers forgive accents, punctuation, contractions and one typo', () => {
  assert.equal(checkTyped('Thank you!', 'thank you'), 'exact');
  assert.equal(checkTyped('thnk you', 'thank you'), 'typo');
  assert.equal(checkTyped("I'm hungry", 'I am hungry'), 'exact');
  assert.equal(checkTyped('owl', 'the owl'), 'exact');
  assert.equal(checkTyped('see you tomorow', 'see you tomorrow'), 'typo');
  assert.equal(checkTyped('goodbye', 'hello'), 'wrong');
  assert.equal(checkTyped('', 'water'), 'wrong');
});

test('typing pays more and combos stack up to a cap', () => {
  assert.equal(xpFor('toEnglish', 0), 10);
  assert.equal(xpFor('type', 0), 15);
  assert.equal(xpFor('toEnglish', 99), 20);
});

test('Duolingo course codes map onto packs', () => {
  assert.equal(packFor('zh'), 'zh');
  assert.equal(packFor('zh-CN'), 'zh');
  assert.equal(packFor('klingon'), null);
});

test('nag gets angrier at night', () => {
  assert.equal(nagMessage({ streak: 509, hour: 23 })[1], 'angry');
  assert.equal(nagMessage({ streak: 509, hour: 8 })[1], 'shocked');
  assert.equal(nagMessage({ streak: 3, hour: 8 })[1], 'happy');
});
