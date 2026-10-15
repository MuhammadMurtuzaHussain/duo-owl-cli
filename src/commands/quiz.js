import { select, input } from '@inquirer/prompts';
import { PACKS, packFor } from '../quiz/packs.js';
import { buildQuestions, checkTyped, xpFor } from '../quiz/engine.js';
import { loadConfig, saveConfig, getToken } from '../config.js';
import { getMe, getPublicUser } from '../api.js';
import {
  owl, bold, dim, green, red, gold, fire, blue, langFlag, fail,
} from '../ui.js';

const CHEERS = ['Nice!', 'Correct!', 'Amazing!', 'You got it!', 'Wow!', 'Look at you go!', 'Sí! Oui! Ja!'];
const BURNS = [
  'Wrong. I am not mad. I am disappointed.',
  'Nope. Duo sheds a single tear.',
  'Incorrect. Have you considered practicing more?',
  'That was not it. I will remember this.',
];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

async function guessLanguage() {
  try {
    if (getToken()) return (await getMe()).learningLanguage;
    const username = loadConfig().username;
    if (username) return (await getPublicUser(username)).learningLanguage;
  } catch {
    // Offline is fine, the quiz doesn't need the network.
  }
  return null;
}

export async function quiz(lang, { rounds = 10 }) {
  let code = packFor(lang);
  if (lang && !code) fail(`No phrase pack for "${lang}" yet. Try one of: ${Object.keys(PACKS).join(', ')}`);
  if (!code) code = packFor(await guessLanguage());
  if (!code) {
    code = await select({
      message: 'Which language?',
      choices: Object.entries(PACKS).map(([k, p]) => ({ name: `${langFlag(k)} ${p.title}`, value: k })),
    });
  }
  const pack = PACKS[code];
  const questions = buildQuestions(pack.phrases, Number(rounds) || 10);

  console.log(`\n${owl('happy', `${pack.title} quiz! ${questions.length} questions, 3 hearts. Don't let me down.`)}\n`);

  let hearts = 3;
  let combo = 0;
  let bestCombo = 0;
  let xp = 0;
  let correct = 0;

  for (const [i, q] of questions.entries()) {
    const header = `${dim(`[${i + 1}/${questions.length}]`)} ${red('♥'.repeat(hearts))}${dim('♡'.repeat(3 - hearts))} ${combo >= 2 ? fire(`${combo}x combo`) : ''}`;
    console.log(header);

    let result;
    if (q.kind === 'type') {
      const shown = q.roman ? `${bold(q.prompt)} ${dim(`(${q.roman})`)}` : bold(q.prompt);
      const answer = await input({ message: `Type this in English: ${shown}` });
      result = checkTyped(answer, q.answer);
    } else if (q.kind === 'toEnglish') {
      const shown = q.roman ? `${bold(q.prompt)} ${dim(`(${q.roman})`)}` : bold(q.prompt);
      const answer = await select({ message: `What does ${shown} mean?`, choices: q.choices.map((c) => ({ name: c, value: c })) });
      result = answer === q.answer ? 'exact' : 'wrong';
    } else {
      const answer = await select({ message: `How do you say ${bold(`"${q.prompt}"`)}?`, choices: q.choices.map((c) => ({ name: c, value: c })) });
      result = answer === q.answer ? 'exact' : 'wrong';
    }

    if (result === 'wrong') {
      hearts--;
      combo = 0;
      const solution = q.kind === 'fromEnglish' && q.roman ? `${q.answer} (${q.roman})` : q.answer;
      console.log(`${red('✘')} ${pick(BURNS)} ${dim('Answer:')} ${bold(solution)}\n`);
      if (hearts === 0) break;
    } else {
      combo++;
      correct++;
      bestCombo = Math.max(bestCombo, combo);
      const gained = xpFor(q.kind, combo - 1);
      xp += gained;
      const typo = result === 'typo' ? dim(` (typo, it's "${q.answer}")`) : '';
      console.log(`${green('✔')} ${green(pick(CHEERS))} ${gold(`+${gained} XP`)}${typo}\n`);
    }
  }

  const cfg = loadConfig();
  const best = cfg.quizBest?.[code] ?? 0;
  const newBest = xp > best;
  if (newBest) saveConfig({ quizBest: { ...cfg.quizBest, [code]: xp } });
  saveConfig({ quizTotalXp: (cfg.quizTotalXp ?? 0) + xp });

  console.log('─'.repeat(40));
  console.log(`  ${bold('Result')}   ${correct}/${questions.length} correct · ${gold(`${xp} XP`)} · best combo ${fire(String(bestCombo))}`);
  if (newBest) console.log(`  ${gold('🏆 New personal best for ' + pack.title + '!')} ${dim(`(was ${best})`)}`);
  else console.log(dim(`  personal best: ${best} XP`));
  console.log(dim('  (quiz XP is just for fun, it does not count on Duolingo)'));
  console.log();

  if (hearts === 0) console.log(owl('sad', 'Out of hearts. In the real app this is where I sell you Super.'));
  else if (correct === questions.length) console.log(owl('proud', 'PERFECT. I have never been prouder. Now go do a real lesson.'));
  else console.log(owl('happy', `Not bad. ${questions.length - correct} mistake${questions.length - correct === 1 ? '' : 's'}. I saw every one of them.`));
  console.log(blue(`\n  Keep going: https://www.duolingo.com/learn\n`));
}
