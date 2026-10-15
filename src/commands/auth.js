import { password } from '@inquirer/prompts';
import { saveConfig, clearConfig, configPath, loadConfig } from '../config.js';
import { userIdFromJwt, getMe, getPublicUser } from '../api.js';
import { owl, bold, dim, green, blue, fail } from '../ui.js';

const HOW_TO = `
${bold('How to grab your Duolingo token')} ${dim('(it never leaves your machine)')}
  1. Open ${blue('https://www.duolingo.com')} in a browser where you are logged in
  2. Open DevTools (${bold('Cmd+Option+J')} on macOS, ${bold('Ctrl+Shift+J')} elsewhere)
  3. Paste this into the console and press Enter:

     ${green("document.cookie.match(/jwt_token=([^;]+)/)[1]")}

  4. Copy the long string it prints (without the quotes) and paste it below.
`;

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

export async function login({ stdin, username }) {
  if (username) {
    const user = await getPublicUser(username);
    saveConfig({ username: user.username });
    console.log(`\n${owl('happy', `Got it, you are ${user.username}. Public commands will default to you. Run \`owl login\` without --username for leagues, XP charts and friends.`)}\n`);
    return;
  }

  let token;
  if (stdin) {
    token = await readStdin();
  } else {
    console.log(HOW_TO);
    token = await password({ message: 'Paste your jwt_token:', mask: '•' });
  }
  token = token.trim().replace(/^["']|["']$/g, '');

  let userId;
  try {
    userId = userIdFromJwt(token);
  } catch (err) {
    fail(err.message);
  }

  // Save first so the API client can use it, then roll back if Duolingo says no.
  const previous = loadConfig();
  saveConfig({ jwt: token, userId });
  try {
    const me = await getMe();
    saveConfig({ username: me.username });
    console.log(`\n${owl('proud', `Welcome back, ${me.name || me.username}. ${me.streak} day streak. I'm watching you.`)}\n`);
    console.log(dim(`Token saved to ${configPath} (readable only by you).`));
  } catch (err) {
    clearConfig();
    saveConfig(previous);
    fail(`That token didn't work: ${err.message}`);
  }
}

export async function logout() {
  clearConfig();
  console.log(`\n${owl('sad', 'Logged out. I will still find you.')}\n`);
}

export async function whoami() {
  const cfg = loadConfig();
  if (!cfg.username && !cfg.jwt) {
    console.log(owl('shocked', 'No idea who you are. Run `owl login`, or `owl login --username <you>`.'));
    return;
  }
  console.log(`${bold(cfg.username ?? '(unknown)')} ${cfg.jwt ? green('● logged in') : dim('○ public mode')}`);
}
