import chalk from 'chalk';
import { resolveUser } from '../resolve.js';
import { getPublicUser, practicedToday, isoDate } from '../api.js';
import {
  owl, box, bar, fmt, flame, langFlag, bold, dim, green, fire, gold, blue, red, purple, padEnd, padStart,
} from '../ui.js';

function streakLine(user) {
  const s = user.streak ?? user.streakData?.currentStreak?.length ?? 0;
  const done = practicedToday(user);
  const status = s === 0 ? dim('no streak') : done ? green('✔ extended today') : red('✘ not yet today');
  return `${flame(s)} ${fire(bold(`${fmt(s)} day streak`))}  ${status}`;
}

function joined(user) {
  if (!user.creationDate) return null;
  const d = new Date(user.creationDate * 1000);
  const years = ((Date.now() - d) / (365.25 * 864e5)).toFixed(1);
  return `${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} ${dim(`(${years} years ago)`)}`;
}

export async function profile(username) {
  const { user, self } = await resolveUser(username);
  const lines = [
    `${bold(user.name || user.username)} ${dim('@' + user.username)}${user.hasPlus ? '  ' + purple('★ Super') : ''}`,
    '',
    streakLine(user),
    `⚡ ${gold(bold(fmt(user.totalXp)))} total XP`,
  ];
  if (self && user.weeklyXp != null) lines.push(`📅 ${fmt(user.weeklyXp)} XP this week, ${fmt(user.monthlyXp)} this month`);
  if (user.gems != null) lines.push(`💎 ${blue(fmt(user.gems))} gems`);
  if (user.health?.healthEnabled && !user.hasPlus) {
    lines.push(`❤️  ${red('♥'.repeat(user.health.hearts))}${dim('♡'.repeat(user.health.maxHearts - user.health.hearts))}`);
  }
  const longest = user.streakData?.longestStreak?.length ?? user.longestStreak;
  if (longest) lines.push(`🏆 longest streak ${fmt(longest)} days`);
  const j = joined(user);
  if (j) lines.push(`🐣 joined ${j}`);
  if (user.learningLanguage) {
    const cur = user.courses?.find((c) => c.id === user.currentCourseId);
    lines.push(`📖 learning ${langFlag(user.learningLanguage)} ${cur?.title ?? user.learningLanguage}`);
  }

  const mood = practicedToday(user) ? 'proud' : 'angry';
  console.log();
  console.log(box(lines, { title: '🦉 Duolingo' }));
  console.log();
  console.log(owl(mood, practicedToday(user)
    ? 'Lesson done. I am proud of you. For now.'
    : 'You have not practiced today. I know where you live.'));
  console.log();
}

export async function courses(username) {
  const { user } = await resolveUser(username);
  const list = [...(user.courses ?? [])].sort((a, b) => b.xp - a.xp);
  if (!list.length) {
    console.log(owl('shocked', 'No courses?! Not even one? Go pick a language.'));
    return;
  }
  const max = list[0].xp;
  // Same course from different base languages ("English" from Spanish and from French) needs a hint.
  const dupes = new Set(list.map((c) => c.title).filter((t, i, a) => a.indexOf(t) !== i));
  const titleOf = (c) => (dupes.has(c.title) ? `${c.title} (from ${c.fromLanguage})` : c.title);
  const nameWidth = Math.max(...list.map((c) => titleOf(c).length));
  console.log(`\n${bold(`${user.username}'s courses`)}\n`);
  for (const c of list) {
    const current = c.id === user.currentCourseId ? green(' ◀ current') : '';
    console.log(
      `${langFlag(c.learningLanguage)} ${padEnd(titleOf(c), nameWidth)}  ${bar(c.xp, max, 28)} ${padStart(fmt(c.xp), 8)} XP${current}`,
    );
  }
  const total = list.reduce((n, c) => n + c.xp, 0);
  console.log(dim(`\n${list.length} course${list.length === 1 ? '' : 's'}, ${fmt(total)} XP across them`));
  if (list.length >= 5) console.log(dim('Polyglot energy. Or commitment issues.'));
  console.log();
}

export async function streak(username) {
  const { user } = await resolveUser(username);
  const s = user.streakData?.currentStreak;
  const n = user.streak ?? s?.length ?? 0;
  const art = n === 0 ? COLD : n < 30 ? SMALL_FIRE : n < 365 ? MEDIUM_FIRE : BIG_FIRE;
  console.log();
  console.log(fire(art));
  console.log(`\n   ${fire(bold(`${fmt(n)} day streak`))} ${dim(`· ${user.username}`)}`);
  if (s?.startDate) console.log(dim(`   started ${s.startDate}`));
  const longest = user.streakData?.longestStreak?.length;
  if (longest && longest > n) console.log(dim(`   personal best: ${fmt(longest)} days (${fmt(longest - n)} to go)`));
  else if (longest && longest === n && n > 1) console.log(gold('   🏆 this IS your personal best. keep going.'));
  const next = MILESTONES.find((m) => m > n);
  if (next) console.log(`   next milestone ${bold(fmt(next))} in ${bold(fmt(next - n))} days ${dim(`(${milestoneDate(next - n)})`)}`);
  console.log();
  console.log(practicedToday(user)
    ? owl('happy', 'Streak extended today. The flame lives.')
    : owl('angry', 'Your streak is not extended today. It would be a shame if something happened to it.'));
  console.log();
}

const MILESTONES = [7, 14, 30, 50, 100, 150, 200, 250, 300, 365, 500, 730, 1000, 1500, 2000, 2500, 3000, 3650, 5000];

function milestoneDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return isoDate(d);
}

export async function battle(a, b) {
  const [left, right] = b
    ? await Promise.all([getPublicUser(a), getPublicUser(b)])
    : [(await resolveUser()).user, await getPublicUser(a)];

  const rows = [
    ['🔥 streak', left.streak ?? 0, right.streak ?? 0],
    ['⚡ total XP', left.totalXp ?? 0, right.totalXp ?? 0],
    ['📚 courses', left.courses?.length ?? 0, right.courses?.length ?? 0],
    ['🌍 top course XP', Math.max(0, ...(left.courses ?? []).map((c) => c.xp)), Math.max(0, ...(right.courses ?? []).map((c) => c.xp))],
    ['🐣 days on Duo', daysSince(left.creationDate), daysSince(right.creationDate)],
  ];

  let lw = 0;
  let rw = 0;
  console.log(`\n   ${chalk.bold.hex('#1CB0F6')(left.username)}  ${dim('vs')}  ${chalk.bold.hex('#FF4B4B')(right.username)}\n`);
  for (const [label, l, r] of rows) {
    const lWin = l > r;
    const rWin = r > l;
    if (lWin) lw++;
    if (rWin) rw++;
    const L = lWin ? blue(bold(fmt(l))) : dim(fmt(l));
    const R = rWin ? red(bold(fmt(r))) : dim(fmt(r));
    console.log(`  ${padEnd(label, 18)} ${padStart(L, 10)} ${lWin ? blue('◀') : ' '}${rWin ? red('▶') : ' '} ${R}`);
  }
  console.log();
  const winner = lw === rw ? null : lw > rw ? left.username : right.username;
  console.log(owl(winner ? 'proud' : 'shocked', winner
    ? `${winner} wins ${Math.max(lw, rw)}-${Math.min(lw, rw)}. The loser owes me a lesson.`
    : `A draw, ${lw}-${rw}. You both owe me a lesson.`));
  console.log();
}

function daysSince(unix) {
  return unix ? Math.floor((Date.now() / 1000 - unix) / 86400) : 0;
}

const COLD = String.raw`
        .  *  .
      *   ___   *
         /   \
        | ❄ ❄ |
         \___/  `;
const SMALL_FIRE = String.raw`
          (
         ) )
        ( ( (
         )_)  `;
const MEDIUM_FIRE = String.raw`
          (  .
       )  ) )
      ( ( ( (  )
       ) )_) )(
      (__(___)_)  `;
const BIG_FIRE = String.raw`
         (    )     (
      )  )\  (    ) )
     ( (( ) )\ ) ( (  )
      ) )\(  ) ( )\ ) (
     ( (  ) /( (  ) /( )
    __)_)_(_)__)_)_(_)__ `;
