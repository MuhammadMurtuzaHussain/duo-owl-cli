#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { login, logout, whoami } from '../src/commands/auth.js';
import { profile, courses, streak, battle } from '../src/commands/profile.js';
import { league, xp, friends } from '../src/commands/stats.js';
import { quiz } from '../src/commands/quiz.js';
import { nag } from '../src/commands/nag.js';
import { owl, fail } from '../src/ui.js';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const run = (fn) => async (...args) => {
  try {
    await fn(...args);
  } catch (err) {
    if (err?.name === 'ExitPromptError') {
      console.log(`\n${owl('sad', 'Leaving already? I will be here. Waiting.')}\n`);
      process.exit(130);
    }
    fail(err.message);
  }
};

const program = new Command()
  .name('owl')
  .description(`${owl('happy', 'An unofficial Duolingo companion for your terminal.')}\n`)
  .version(pkg.version);

program.command('login')
  .description('save your Duolingo token (or just a username for public stats)')
  .option('-u, --username <name>', 'public mode: remember a username, no token needed')
  .option('--stdin', 'read the token from stdin, e.g. `pbpaste | owl login --stdin`')
  .action(run(login));

program.command('logout').description('forget your token').action(run(logout));
program.command('whoami').description('show who owl thinks you are').action(run(whoami));

program.command('profile [username]').alias('me')
  .description('your (or anyone\'s) profile card')
  .action(run(profile));

program.command('streak [username]')
  .description('streak, milestones and a fire whose size you earned')
  .action(run(streak));

program.command('courses [username]')
  .description('every course with XP bars')
  .action(run(courses));

program.command('battle <user> [other]')
  .description('head to head stats; with one name it\'s you vs them')
  .action(run(battle));

program.command('league').alias('lb')
  .description('this week\'s league with promotion and demotion zones (login)')
  .action(run(league));

program.command('xp')
  .description('daily XP chart (login)')
  .option('-d, --days <n>', 'how many days back, up to 60', '14')
  .action(run(xp));

program.command('friends')
  .description('you vs everyone you follow (login)')
  .option('-s, --sort <by>', 'weekly | monthly | total', 'weekly')
  .option('-n, --limit <n>', 'how many to show', '20')
  .action(run(friends));

program.command('quiz [language]')
  .description('offline phrase quiz with hearts and combos (zh, ar, es, fr, de, ja, it, pt, ko)')
  .option('-r, --rounds <n>', 'number of questions', '10')
  .action(run(quiz));

program.command('nag')
  .description('guilt trip if you haven\'t practiced today; put `owl nag --quiet` in your shell rc')
  .option('-q, --quiet', 'say nothing when you already practiced, or on errors')
  .action(run(nag));

program.action(run(() => profile()));

await program.parseAsync();
