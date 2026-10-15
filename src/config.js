import { mkdirSync, readFileSync, writeFileSync, rmSync, chmodSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const dir = process.env.OWL_CONFIG_DIR
  || join(process.env.XDG_CONFIG_HOME || join(homedir(), '.config'), 'duo-owl-cli');
const file = join(dir, 'config.json');

export const configPath = file;

export function loadConfig() {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

export function saveConfig(patch) {
  const next = { ...loadConfig(), ...patch };
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  writeFileSync(file, JSON.stringify(next, null, 2) + '\n', { mode: 0o600 });
  // The file may already exist with looser permissions; it can hold a JWT.
  chmodSync(file, 0o600);
  return next;
}

export function clearConfig() {
  rmSync(file, { force: true });
}

/** Token from the environment wins over the stored one, handy for CI and scripts. */
export function getToken() {
  return process.env.DUOLINGO_JWT || loadConfig().jwt || null;
}
