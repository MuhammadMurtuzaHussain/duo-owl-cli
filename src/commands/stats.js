import chalk from 'chalk';
import {
  getLeaderboard, getXpSummaries, getFollowing, getMe, currentUserId, leagueZones, LEAGUES,
} from '../api.js';
import {
  owl, bar, sparkline, fmt, bold, dim, green, red, gold, fire, blue, padEnd, padStart,
} from '../ui.js';

export function renderLeague(lb, me) {
  const active = lb.active;
  if (!active?.cohort) {
    return { text: owl('sleepy', `You're not in a league this week. Do ${lb.num_sessions_remaining_to_unlock ?? 'a'} lesson(s) to join one.`), mood: null };
  }
  const tier = lb.tier ?? active.cohort.tier ?? 0;
  const league = LEAGUES[tier] ?? { name: `Tier ${tier}`, color: '#FFFFFF', gem: '🏅' };
  const ranks = [...active.cohort.rankings].sort((a, b) => b.score - a.score);
  const { promoted, demoteFrom } = leagueZones(active, tier);
  const myIndex = ranks.findIndex((r) => r.user_id === me);
  const myRank = myIndex + 1;
  const end = new Date(active.contest.contest_end);
  const hoursLeft = Math.max(0, Math.round((end - Date.now()) / 36e5));
  const left = hoursLeft >= 48 ? `${Math.round(hoursLeft / 24)} days` : `${hoursLeft} hours`;

  const out = [];
  out.push('');
  out.push(`  ${league.gem} ${chalk.bold.hex(league.color)(`${league.name} League`)}  ${dim(`· ends in ${left}`)}`);
  if (promoted) out.push(dim(`  top ${promoted} advance${demoteFrom !== Infinity ? `, ${ranks.length - demoteFrom + 1} drop` : ''}`));
  out.push('');
  const top = ranks[0]?.score ?? 1;
  ranks.forEach((r, i) => {
    const rank = i + 1;
    if (rank === promoted + 1 && promoted) out.push(green('  ── ▲ promotion zone ▲ ─────────────────────────────'));
    if (rank === demoteFrom) out.push(red('  ── ▼ demotion zone ▼ ──────────────────────────────'));
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : padStart(String(rank), 2) + '';
    const isMe = r.user_id === me;
    const name = padEnd((r.display_name || '???').slice(0, 20), 20);
    const done = r.streak_extended_today ? fire('🔥') : '  ';
    const line = `  ${padStart(medal, 2)}  ${isMe ? chalk.bold.hex('#FF9600')(name) : name} ${done} ${bar(r.score, top, 18, isMe ? fire : rank <= promoted ? green : blue)} ${padStart(fmt(r.score), 6)} XP`;
    out.push(isMe ? chalk.bgHex('#2a2a2a')(line + ' ◀ you') : line);
  });
  out.push('');

  let mood;
  let msg;
  if (myRank === 1) {
    mood = 'proud';
    msg = 'First place. Do not get comfortable.';
  } else if (promoted && myRank <= promoted) {
    const gap = ranks[promoted]?.score != null ? ranks[myIndex].score - ranks[promoted].score : 0;
    mood = 'happy';
    msg = `Rank ${myRank}, safe by ${fmt(gap)} XP. For now.`;
  } else if (myRank >= demoteFrom) {
    const need = ranks[demoteFrom - 2].score - ranks[myIndex].score + 1;
    mood = 'angry';
    msg = `Rank ${myRank}. DEMOTION ZONE. You need ${fmt(need)} XP to escape. Go. Now.`;
  } else {
    const need = promoted ? ranks[promoted - 1].score - ranks[myIndex].score + 1 : 0;
    mood = 'shocked';
    msg = promoted
      ? `Rank ${myRank}. ${fmt(need)} XP gets you into the promotion zone. Just saying.`
      : `Rank ${myRank}. Diamond league, nowhere higher to go. Fight for first.`;
  }
  out.push(owl(mood, msg));
  out.push('');
  return { text: out.join('\n'), mood };
}

export async function league() {
  const [lb, me] = [await getLeaderboard(), currentUserId()];
  console.log(renderLeague(lb, me).text);
}

export function renderXp(summaries, goal = 10) {
  const out = [];
  const max = Math.max(...summaries.map((s) => s.gainedXp ?? 0), goal);
  const total = summaries.reduce((n, s) => n + (s.gainedXp ?? 0), 0);
  const active = summaries.filter((s) => (s.gainedXp ?? 0) > 0).length;
  const best = summaries.reduce((a, s) => ((s.gainedXp ?? 0) > (a.gainedXp ?? 0) ? s : a), summaries[0] ?? {});
  out.push('');
  out.push(`  ${bold('XP, last ' + summaries.length + ' days')}   ${sparkline(summaries.map((s) => s.gainedXp ?? 0))}`);
  out.push('');
  for (const s of summaries) {
    const d = new Date(s.date * 1000);
    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
    const xp = s.gainedXp ?? 0;
    const tag = s.frozen ? blue(' 🧊 freeze') : s.repaired ? blue(' 🔧 repaired') : xp >= goal ? '' : xp > 0 ? dim(' below goal') : red(' 💀');
    const color = xp >= goal ? green : xp > 0 ? gold : red;
    const mins = s.totalSessionTime ? dim(` ${Math.max(1, Math.round(s.totalSessionTime / 60))}m`) : '';
    out.push(`  ${padEnd(label, 12)} ${bar(xp, max, 30, color)} ${padStart(fmt(xp), 5)}${mins}${s.streakExtended ? ' ' + fire('🔥') : ''}${tag}`);
  }
  out.push('');
  out.push(`  ${gold(bold(fmt(total)))} XP total · ${fmt(Math.round(total / Math.max(1, summaries.length)))} per day · active ${active}/${summaries.length} days`);
  if (best?.gainedXp) {
    const bd = new Date(best.date * 1000).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    out.push(dim(`  best day: ${bd} with ${fmt(best.gainedXp)} XP`));
  }
  out.push('');
  const ratio = active / Math.max(1, summaries.length);
  out.push(owl(ratio === 1 ? 'proud' : ratio > 0.7 ? 'happy' : 'sad',
    ratio === 1 ? 'Every single day. Respect.'
      : ratio > 0.7 ? 'Solid. A few gaps. I noticed them.'
        : 'Those empty days hurt me. Personally.'));
  out.push('');
  return out.join('\n');
}

export async function xp({ days }) {
  const n = Math.min(60, Math.max(1, Number(days) || 14));
  const [summaries, me] = await Promise.all([getXpSummaries(n), getMe()]);
  console.log(renderXp(summaries, me.xpGoal ?? 10));
}

export async function friends({ sort = 'weekly', limit = 20 }) {
  const [list, me] = await Promise.all([getFollowing(), getMe()]);
  const key = sort === 'total' ? 'totalXp' : sort === 'monthly' ? 'monthlyXp' : 'weeklyXp';
  const everyone = [
    ...list.map((f) => ({ ...f, isMe: false })),
    { username: me.username, name: me.name, weeklyXp: me.weeklyXp, monthlyXp: me.monthlyXp, totalXp: me.totalXp, hasRecentActivity15: true, isMe: true },
  ].sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0));
  const shown = everyone.slice(0, Number(limit));
  if (!shown.some((f) => f.isMe)) shown.push(everyone.find((f) => f.isMe));
  const top = shown[0]?.[key] || 1;
  const label = { weeklyXp: 'this week', monthlyXp: 'this month', totalXp: 'all time' }[key];
  console.log(`\n  ${bold(`You vs the ${list.length} people you follow`)} ${dim(`· XP ${label}`)}\n`);
  shown.forEach((f) => {
    const rank = everyone.indexOf(f) + 1;
    const name = padEnd((f.name || f.username).slice(0, 22), 22);
    const online = f.hasRecentActivity15 ? green('●') : dim('○');
    const row = `  ${padStart(String(rank), 3)}. ${online} ${f.isMe ? fire(bold(name)) : name} ${bar(f[key] ?? 0, top, 22, f.isMe ? fire : blue)} ${padStart(fmt(f[key]), 8)}`;
    console.log(f.isMe ? row + fire(' ◀ you') : row);
  });
  const myRank = everyone.findIndex((f) => f.isMe) + 1;
  console.log();
  console.log(owl(myRank === 1 ? 'proud' : myRank <= 3 ? 'happy' : 'angry',
    myRank === 1 ? 'You are beating all of your friends. Are they even trying?'
      : `You are #${myRank} of ${everyone.length}. ${everyone[myRank - 2]?.name || everyone[myRank - 2]?.username} is ${fmt((everyone[myRank - 2]?.[key] ?? 0) - (everyone[myRank - 1]?.[key] ?? 0))} XP ahead.`));
  console.log();
}
