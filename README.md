# 🦉 duo-owl-cli

An unofficial Duolingo companion for your terminal: streaks, leagues, XP charts, friend rankings, an offline quiz game, and a passive-aggressive owl that guilt-trips you when you open a shell without having practiced.

```
  \   /       __________________________________________
 ( ò v ó )  <| Rank 11. DEMOTION ZONE. You need 3 XP to |
 /)     (\   | escape. Go. Now.                         |
  "\_^_/"     ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
```

> Not affiliated with or endorsed by Duolingo. It uses the same unofficial web endpoints the Duolingo website uses, which can change at any time.

## Install

Requires Node.js 22.12 or newer.

```bash
npm install -g github:MuhammadMurtuzaHussain/duo-owl-cli
```

Or from a clone:

```bash
git clone https://github.com/MuhammadMurtuzaHussain/duo-owl-cli && cd duo-owl-cli && npm install && npm link
```

## Log in

**Public mode** (no token, works for streak, profile, courses and battles):

```bash
owl login --username YourDuolingoName
```

**Full mode** (adds leagues, XP history and friends). Owl needs your Duolingo session token:

1. Open [duolingo.com](https://www.duolingo.com) in a browser where you're logged in.
2. Open the DevTools console (`Cmd+Option+J` on macOS, `Ctrl+Shift+J` on Windows/Linux).
3. Run `document.cookie.match(/jwt_token=([^;]+)/)[1]` and copy the result.
4. Run `owl login` and paste it (input is masked). Or skip the prompt with `pbpaste | owl login --stdin`.

The token is stored in `~/.config/duo-owl-cli/config.json` with `600` permissions and is only ever sent to `duolingo.com`. You can also set `DUOLINGO_JWT` in your environment instead. Treat it like a password: anyone holding it can act as you on Duolingo. `owl logout` deletes it.

## Commands

| Command | What it does | Login |
| --- | --- | --- |
| `owl` / `owl me [user]` | Profile card: streak, XP, gems, hearts, current course | public |
| `owl streak [user]` | Streak with a fire that grows with it, personal best, next milestone date | public |
| `owl courses [user]` | Every course with XP bars | public |
| `owl battle <user> [other]` | Head to head. With one name it's you vs them | public |
| `owl league` | This week's league, promotion and demotion zones, how much XP you need | token |
| `owl xp [-d 30]` | Daily XP chart with streak freezes, sparkline and stats | token |
| `owl friends [-s weekly\|monthly\|total]` | You ranked against everyone you follow | token |
| `owl quiz [lang]` | Offline phrase quiz: 3 hearts, combos, typo-tolerant answers, personal bests | none |
| `owl nag [-q]` | Guilt trip if you haven't practiced today. Gets angrier as midnight approaches | public |

### Sample: `owl league`

```
  🖤 Obsidian League  · ends in 3 days
  top 8 advance, 5 drop

  🥇  Ada Lovelace            ██████████████████    388 XP
  🥈  Alan Turing             ███████████░░░░░░░    235 XP
  🥉  Grace Hopper            ███████░░░░░░░░░░░    148 XP
   4  Linus T              🔥 ███████░░░░░░░░░░░    145 XP
   …
   8  Barbara L               ████░░░░░░░░░░░░░░     89 XP
  ── ▲ promotion zone ▲ ─────────────────────────────
  ── ▼ demotion zone ▼ ──────────────────────────────
   9  Edsger D                ████░░░░░░░░░░░░░░     89 XP
  10  Donald Knuth            ████░░░░░░░░░░░░░░     88 XP
  11  Me Myself            🔥 ████░░░░░░░░░░░░░░     87 XP ◀ you
```

### Sample: `owl xp`

```
  XP, last 14 days   ·█████████·█▇▄

  Fri, Oct 2   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░     0 🧊 freeze
  Sat, Oct 3   ███████████████████████████░░░    35 1m 🔥
  …
  Thu, Oct 15  ████████████░░░░░░░░░░░░░░░░░░    16 1m 🔥

  421 XP total · 30 per day · active 12/14 days
```

### Quiz packs

`zh` Chinese (with pinyin), `ar` Arabic, `es` Spanish, `fr` French, `de` German, `ja` Japanese, `it` Italian, `pt` Portuguese, `ko` Korean. With no argument it picks the language you're learning on Duolingo. PRs adding packs are welcome: they live in [`src/quiz/packs.js`](src/quiz/packs.js).

## Let the owl haunt your shell

Add this to `~/.zshrc` or `~/.bashrc`:

```bash
owl nag --quiet
```

Every new terminal checks your streak. If you've practiced, it stays silent. If not, Duo has words for you.

## Development

```bash
npm install
npm test                      # unit tests, no network
node bin/owl.js --help
```

Run every logged-in command offline against recorded, anonymized responses:

```bash
export DUOLINGO_JWT="x.$(printf '{"sub":1}' | base64 | tr '+/' '-_' | tr -d '=').y"
node --import ./test/mock-fetch.js bin/owl.js league
```

### Endpoints used

| Data | Endpoint |
| --- | --- |
| Public profile | `GET www.duolingo.com/2017-06-30/users?username=…` |
| Your profile | `GET www.duolingo.com/2017-06-30/users/{id}?fields=…` |
| XP history | `GET www.duolingo.com/2017-06-30/users/{id}/xp_summaries?startDate&endDate&timezone` |
| Following | `GET www.duolingo.com/2017-06-30/users/{id}/subscriptions` |
| League | `GET duolingo-leaderboards-prod.duolingo.com/leaderboards/7d9f5dd1-…/users/{id}` |

Your user id comes from the `sub` claim of your JWT.

## License

MIT
