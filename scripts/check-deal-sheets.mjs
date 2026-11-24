#!/usr/bin/env node
// Stops a deploy when a proposal goes out without its deal sheet, or with one that is incomplete.
// Run by build.sh. Also: `node scripts/check-deal-sheets.mjs` any time, or with a folder name to
// check one proposal: `node scripts/check-deal-sheets.mjs rc-all-exteriors`.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractDealSheet, summaryLines, validateDealSheet } from './deal-sheet.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const clients = join(root, 'clients');
const legacy = JSON.parse(readFileSync(join(root, 'scripts', 'deal-sheet-legacy.json'), 'utf8')).skip;
const only = process.argv[2];

/** Check every proposal folder. Returns { failed, lines }. Exported for the tests. */
export function checkAll(dir = clients, skip = legacy, pick = only) {
  const lines = [];
  let failed = 0;
  const folders = readdirSync(dir).filter((f) => statSync(join(dir, f)).isDirectory() && existsSync(join(dir, f, 'index.html'))).sort();
  for (const folder of folders) {
    if (pick && folder !== pick) continue;
    if (Object.hasOwn(skip, folder) && !pick) { lines.push(`skip  ${folder} (${skip[folder]})`); continue; }
    const got = extractDealSheet(readFileSync(join(dir, folder, 'index.html'), 'utf8'));
    if (got.error) { failed++; lines.push(`FAIL  ${folder}: ${got.error}`); continue; }
    const { errors, warnings } = validateDealSheet(got.sheet, { folder });
    if (errors.length) {
      failed++;
      lines.push(`FAIL  ${folder}: the deal sheet is missing or has wrong items:`);
      for (const e of errors) lines.push(`        - ${e}`);
    } else {
      lines.push(`ok    ${folder}`);
      if (pick) for (const l of summaryLines(got.sheet)) lines.push(`        ${l}`);
    }
    for (const w of warnings) lines.push(`        note: ${w}`);
  }
  return { failed, lines };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { failed, lines } = checkAll();
  console.log('Deal sheets:');
  for (const l of lines) console.log(`  ${l}`);
  if (failed) {
    console.error(`\n${failed} proposal${failed === 1 ? '' : 's'} cannot go out yet. Fix the deal sheet in clients/<name>/index.html.`);
    console.error('How: adr/ADR-002-deal-sheet-on-every-proposal.md');
    process.exit(1);
  }
}
