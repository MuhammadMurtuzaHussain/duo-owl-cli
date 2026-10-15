import chalk from 'chalk';
import stringWidth from 'string-width';

export const green = chalk.hex('#58CC02');
export const owlGreen = chalk.hex('#89E219');
export const fire = chalk.hex('#FF9600');
export const gold = chalk.hex('#FFC800');
export const blue = chalk.hex('#1CB0F6');
export const red = chalk.hex('#FF4B4B');
export const purple = chalk.hex('#CE82FF');
export const dim = chalk.dim;
export const bold = chalk.bold;

const MOODS = {
  happy: ['  ^   ^  ', ' ( o v o )'],
  proud: ['  ^   ^  ', ' ( ^ v ^ )'],
  angry: ['  \\   /  ', ' ( ò v ó )'],
  sad: ['  ^   ^  ', ' ( ; v ; )'],
  shocked: ['  ^   ^  ', ' ( O v O )'],
  sleepy: ['  ^   ^  ', ' ( - v - )'],
};

/** A tiny Duo. `mood` changes the eyes, `says` adds a speech bubble. */
export function owl(mood = 'happy', says) {
  const [ears, face] = MOODS[mood] ?? MOODS.happy;
  const body = [ears, face, ' /)     (\\', '  "\\_^_/"'].map((l) => owlGreen(padEnd(l, 11)));
  if (!says) return body.join('\n');
  const lines = wrap(says, 44);
  const width = Math.max(...lines.map(visibleLength));
  const bubble = [
    ' ' + '_'.repeat(width + 2),
    ...lines.map((l) => `| ${l}${' '.repeat(width - visibleLength(l))} |`),
    ' ' + '‾'.repeat(width + 2),
  ];
  const out = [];
  const rows = Math.max(body.length, bubble.length);
  const offset = Math.max(0, Math.floor((bubble.length - body.length) / 2));
  for (let i = 0; i < rows; i++) {
    const b = body[i - offset] ?? ' '.repeat(11);
    const tail = i === offset + 1 ? ' <' : '  ';
    out.push(`${b}${tail}${bubble[i] ?? ''}`);
  }
  return out.join('\n');
}

export function wrap(text, width) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    if (line && visibleLength(line) + 1 + visibleLength(w) > width) {
      lines.push(line);
      line = w;
    } else {
      line = line ? `${line} ${w}` : w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Terminal columns, so emoji and CJK count as two and colour codes count as zero. */
export function visibleLength(s) {
  return stringWidth(String(s));
}

export function padEnd(s, n) {
  return s + ' '.repeat(Math.max(0, n - visibleLength(s)));
}

export function padStart(s, n) {
  return ' '.repeat(Math.max(0, n - visibleLength(s))) + s;
}

export function bar(value, max, width = 24, color = green) {
  const ratio = max > 0 ? Math.min(1, value / max) : 0;
  const full = Math.round(ratio * width);
  return color('█'.repeat(full)) + dim('░'.repeat(width - full));
}

const SPARKS = '▁▂▃▄▅▆▇█';
export function sparkline(values) {
  const max = Math.max(...values, 1);
  return values
    .map((v) => (v <= 0 ? dim('·') : SPARKS[Math.min(7, Math.floor((v / max) * 7.999))]))
    .join('');
}

export function box(lines, { title, color = green } = {}) {
  const width = Math.max(...lines.map(visibleLength), title ? visibleLength(title) + 2 : 0);
  const top = title
    ? `╭─ ${title} ${'─'.repeat(Math.max(0, width - visibleLength(title) - 1))}╮`
    : `╭${'─'.repeat(width + 2)}╮`;
  return [
    color(top),
    ...lines.map((l) => `${color('│')} ${padEnd(l, width)} ${color('│')}`),
    color(`╰${'─'.repeat(width + 2)}╯`),
  ].join('\n');
}

export function fmt(n) {
  return Number(n ?? 0).toLocaleString('en-US');
}

/** Streak flame that grows with the streak. */
export function flame(streak) {
  if (!streak) return dim('🧊');
  if (streak >= 365) return '🔥🔥🔥';
  if (streak >= 100) return '🔥🔥';
  return '🔥';
}

const FLAGS = {
  ar: '🇸🇦', ca: '🏴', cs: '🇨🇿', cy: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', da: '🇩🇰', de: '🇩🇪', el: '🇬🇷', en: '🇬🇧', eo: '💚',
  es: '🇪🇸', fi: '🇫🇮', fr: '🇫🇷', ga: '🇮🇪', gd: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', he: '🇮🇱', hi: '🇮🇳', ht: '🇭🇹', hu: '🇭🇺',
  hv: '🐉', hw: '🌺', id: '🇮🇩', it: '🇮🇹', ja: '🇯🇵', kl: '🖖', ko: '🇰🇷', la: '🏛️', nl: '🇳🇱',
  'nb': '🇳🇴', no: '🇳🇴', pl: '🇵🇱', pt: '🇧🇷', ro: '🇷🇴', ru: '🇷🇺', sv: '🇸🇪', sw: '🇰🇪', tr: '🇹🇷',
  uk: '🇺🇦', vi: '🇻🇳', yi: '🕍', zh: '🇨🇳', zs: '🇨🇳', zu: '🇿🇦', math: '🧮', music: '🎵', chess: '♟️',
};
export function langFlag(code) {
  return FLAGS[code] ?? '🌍';
}

export function fail(message) {
  console.error(`\n${owl('sad', message)}\n`);
  process.exit(1);
}
