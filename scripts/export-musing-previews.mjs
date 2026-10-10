// Rebuild the static share cards: node scripts/export-musing-previews.mjs
// Typography and diagrams remain editable SVG; crawlers receive 1200 × 630 PNGs.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const previews = JSON.parse(await fs.readFile(path.join(root, 'src/data/musing-previews.json'), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const text = (x, y, value, size = 18, color = '#e2e7ff') => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}">${escape(value)}</text>`;
const panel = content => `<rect x="704" y="111" width="444" height="438" rx="3" fill="#12172a" stroke="#7385ff"/>${content}`;

function illustration(slug) {
  if (slug === 'searchable-memory') {
    return panel(text(730, 148, 'MODEL + SEARCHABLE MEMORY', 15, '#f1fa8c') +
      text(730, 218, 'FP16 EQUIVALENT', 14) + text(730, 250, '1,644.3 MB', 24, '#fff') +
      '<rect x="730" y="271" width="390" height="23" fill="#a8b5ff"/>' +
      text(730, 353, 'PACKED STORAGE', 14) + text(730, 385, '663.5 MB', 24, '#fff') +
      '<rect x="730" y="406" width="157.36" height="23" fill="#f1fa8c"/>' +
      text(730, 495, '5,183 passages / same parameter count', 13));
  }
  if (slug === 'cities-in-the-weights') {
    const grid = Array.from({ length: 200 }, (_, i) => `<rect x="${736 + (i % 20) * 19}" y="${211 + Math.floor(i / 20) * 19}" width="10" height="10" rx="1" fill="${i === 87 ? '#f1fa8c' : '#344264'}"/>`).join('');
    return panel(text(730, 148, '200 CITY OUTPUTS', 15, '#f1fa8c') + grid +
      text(730, 458, 'Paris → 1', 28, '#fff') + text(730, 495, 'One name in. One output on.', 15));
  }
  if (slug === 'eldorado') {
    return panel(text(730, 148, 'SOURCE-LINKED JOURNEYS', 15, '#f1fa8c') +
      '<g fill="none" stroke="#94d8ff" stroke-width="4" stroke-linecap="round"><path d="M746 242 C798 206 822 307 882 283 S980 341 1040 277 S1095 277 1119 258"/><path d="M882 283 C850 330 842 366 802 402"/><path d="M974 305 C955 354 1010 396 1062 418"/><path d="M832 271 C852 233 848 209 876 191"/></g>' +
      [[772, 239], [882, 283], [974, 305], [1071, 271], [802, 402]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#f1fa8c" stroke="#12172a" stroke-width="2"/>`).join('') +
      text(730, 495, 'Accounts → places → evidence', 16));
  }
  if (slug === 'reflexivity-maxxing') {
    return panel(text(730, 148, 'A CHANGE IN THE PERSON ACTING', 15, '#f1fa8c') +
      '<path d="M852 232 C971 169 1102 271 1036 384 M1007 419 C863 496 761 375 816 273" fill="none" stroke="#7385ff" stroke-width="2"/>' +
      '<path d="M1024 365 L1036 386 L1057 374 M800 283 L816 270 L828 291" fill="none" stroke="#f1fa8c" stroke-width="2"/>' +
      text(767, 244, 'NOTICE', 22, '#fff') + text(984, 326, 'REFLECT', 22, '#fff') +
      text(862, 429, 'ACT', 22, '#f1fa8c') + text(730, 505, '“I remember. I will act.”', 17));
  }
  return panel(text(730, 148, 'FROM THE NOTEBOOK', 15, '#f1fa8c') +
    ['A memory you can search', 'Codex in the dungeon', 'Tracing the Amazon', 'Reflexivity maxxing'].map((label, i) =>
      `<line x1="730" y1="${199 + i * 75}" x2="1120" y2="${199 + i * 75}" stroke="#344264"/>` + text(730, 239 + i * 75, label, 18, '#fff')).join(''));
}

for (const [slug, preview] of Object.entries(previews)) {
  if (!preview.lines) continue; // Preserve the existing Codex recording card.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#2544fe"/>
<g font-family="DejaVu Sans Mono,monospace" fill="white">
${text(58, 63, 'SAI SURBEHERA / MUSINGS', 15, '#c9d1ff')}
${preview.lines.map((line, i) => text(55, 208 + i * 82, line, 60, '#fff')).join('')}
${preview.subtitle.map((line, i) => text(58, 373 + i * 37, line, 22, i ? '#f1fa8c' : '#e2e7ff')).join('')}
${text(58, 568, preview.footer, 15, '#c9d1ff')}
${illustration(slug)}
</g></svg>`;
  const output = path.join(root, 'public', preview.image);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output.replace(/\.png$/, '.svg'), svg);
  await sharp(Buffer.from(svg)).png().toFile(output);
  console.log(`${preview.path} → ${preview.image}`);
}
