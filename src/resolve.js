import { getToken, loadConfig } from './config.js';
import { getMe, getPublicUser } from './api.js';
import { fail } from './ui.js';

/**
 * Figures out whose data to show: an explicit username (public API), else the logged-in user
 * (private API, richer data), else the username remembered by `owl login --username`.
 */
export async function resolveUser(username) {
  if (username) return { user: await getPublicUser(username), self: false };
  if (getToken()) return { user: await getMe(), self: true };
  const saved = loadConfig().username;
  if (saved) return { user: await getPublicUser(saved), self: true };
  fail('Who are you? Pass a username, or run `owl login` (or `owl login --username <you>`).');
}
