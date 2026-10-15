import { getToken, loadConfig } from '../config.js';
import { getMe, getPublicUser, practicedToday } from '../api.js';
import { owl, fmt } from '../ui.js';

// Escalates the later it gets and the bigger the streak at risk.
export function nagMessage({ streak, hour, name }) {
  const who = name ? `${name}, ` : '';
  if (hour >= 22) return [`${who}it is ${hour}:00. Your ${fmt(streak)} day streak dies at midnight. I am outside.`, 'angry'];
  if (hour >= 19) return [`${who}evening reminder: ${fmt(streak)} days of work, gone in a few hours. Your call.`, 'angry'];
  if (streak >= 365) return [`${who}${fmt(streak)} days. More than a year. Imagine losing that to laziness.`, 'shocked'];
  if (streak === 0) return [`${who}no streak to lose. Which is honestly worse. Start one.`, 'sad'];
  if (hour < 10) return [`Good morning ${who}a quick lesson now keeps me away later.`, 'happy'];
  return [`${who}these reminders don't seem to be working. I'll stop sending them... for now.`, 'sad'];
}

export async function nag({ quiet }) {
  let user;
  try {
    if (getToken()) user = await getMe();
    else if (loadConfig().username) user = await getPublicUser(loadConfig().username);
  } catch (err) {
    // A shell hook must never make opening a terminal annoying.
    if (!quiet) console.error(err.message);
    return;
  }
  if (!user) {
    if (!quiet) console.log('Run `owl login` first so I know whom to haunt.');
    return;
  }

  if (practicedToday(user)) {
    if (!quiet) console.log(owl('proud', `You practiced today. ${fmt(user.streak)} days and counting. You may live.`));
    return;
  }
  const [msg, mood] = nagMessage({ streak: user.streak ?? 0, hour: new Date().getHours(), name: user.name?.split(' ')[0] });
  console.log(`\n${owl(mood, msg)}\n`);
}
