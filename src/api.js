import { getToken, loadConfig } from './config.js';

const WWW = 'https://www.duolingo.com/2017-06-30';
const LEADERBOARDS = 'https://duolingo-leaderboards-prod.duolingo.com/leaderboards/7d9f5dd1-8423-491a-91f2-2532052038ce';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36';

export const LEAGUES = [
  { name: 'Bronze', color: '#CD7F32', gem: '🥉' },
  { name: 'Silver', color: '#C0C0C0', gem: '🥈' },
  { name: 'Gold', color: '#FFC800', gem: '🥇' },
  { name: 'Sapphire', color: '#1CB0F6', gem: '💎' },
  { name: 'Ruby', color: '#FF4B4B', gem: '❤️‍🔥' },
  { name: 'Emerald', color: '#58CC02', gem: '💚' },
  { name: 'Amethyst', color: '#CE82FF', gem: '🔮' },
  { name: 'Pearl', color: '#FFB6C1', gem: '🦪' },
  { name: 'Obsidian', color: '#8E8E93', gem: '🖤' },
  { name: 'Diamond', color: '#7DF9FF', gem: '💠' },
];

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/** Reads the user id out of a Duolingo JWT without verifying it (the server does that). */
export function userIdFromJwt(jwt) {
  const part = String(jwt).split('.')[1];
  if (!part) throw new Error('That does not look like a JWT (expected three dot-separated parts).');
  const payload = JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
  if (!payload.sub) throw new Error('JWT has no "sub" claim, so I cannot tell who you are.');
  return Number(payload.sub);
}

async function request(url, { auth = false } = {}) {
  const headers = { 'User-Agent': UA, Accept: 'application/json' };
  if (auth) {
    const token = getToken();
    if (!token) throw new ApiError('You need to log in for this one. Run `owl login` first.', 401);
    headers.Authorization = `Bearer ${token}`;
  }
  let res;
  try {
    res = await fetch(url, { headers });
  } catch (err) {
    throw new ApiError(`Could not reach Duolingo (${err.cause?.code ?? err.message}). Are you online?`, 0);
  }
  if (res.status === 401 || res.status === 403) {
    throw new ApiError('Duolingo rejected your token. It probably expired, run `owl login` again.', res.status);
  }
  if (!res.ok) throw new ApiError(`Duolingo answered ${res.status} for ${new URL(url).pathname}`, res.status);
  return res.json();
}

/** Public profile lookup, no login needed. */
export async function getPublicUser(username) {
  const data = await request(`${WWW}/users?username=${encodeURIComponent(username)}`);
  const user = data.users?.[0];
  if (!user) throw new ApiError(`No Duolingo user called "${username}". Typo, or a ghost?`, 404);
  return user;
}

const ME_FIELDS = [
  'id', 'username', 'name', 'streak', 'streakData', 'totalXp', 'weeklyXp', 'monthlyXp', 'xpGoal',
  'xpGoalMetToday', 'gems', 'lingots', 'health', 'hasPlus', 'courses', 'currentCourseId',
  'learningLanguage', 'fromLanguage', 'creationDate', 'timezone', 'longestStreak', 'xpGains',
].join(',');

export async function getMe() {
  const id = currentUserId();
  return request(`${WWW}/users/${id}?fields=${ME_FIELDS}`, { auth: true });
}

export async function getXpSummaries(days = 14, timezone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  const id = currentUserId();
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  const qs = new URLSearchParams({ startDate: isoDate(start), endDate: isoDate(end), timezone });
  const data = await request(`${WWW}/users/${id}/xp_summaries?${qs}`, { auth: true });
  return (data.summaries ?? []).sort((a, b) => a.date - b.date);
}

export async function getLeaderboard() {
  const id = currentUserId();
  return request(`${LEADERBOARDS}/users/${id}?client_unlocked=true`, { auth: true });
}

export async function getFollowing() {
  const id = currentUserId();
  const data = await request(`${WWW}/users/${id}/subscriptions`, { auth: true });
  return data.subscriptions ?? [];
}

export function currentUserId() {
  const token = getToken();
  if (!token) throw new ApiError('You need to log in for this one. Run `owl login` first.', 401);
  return loadConfig().userId ?? userIdFromJwt(token);
}

export function isoDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Works out who goes up and who goes down. Duolingo's ruleset gives promotion counts indexed by
 * the current tier and demotion counts indexed by tier - 1 (Bronze can't drop, Diamond can't rise).
 */
export function leagueZones(active, tier) {
  const rules = active?.contest?.ruleset ?? {};
  const size = rules.cohort_size ?? active?.cohort?.rankings?.length ?? 0;
  const promoted = tier < LEAGUES.length - 1 ? (rules.num_promoted?.[tier] ?? 0) : 0;
  const demoted = tier > 0 ? (rules.num_demoted?.[tier - 1] ?? 0) : 0;
  const demoteFrom = demoted ? Math.max(promoted + 1, size - demoted + 1) : Infinity;
  return { promoted, demoteFrom };
}

/** Did this user practice today, judged from the public streak data? */
export function practicedToday(user, today = isoDate(new Date())) {
  const cur = user.streakData?.currentStreak;
  if (user.xpGoalMetToday) return true;
  return Boolean(cur && (cur.lastExtendedDate ?? cur.endDate) === today);
}
