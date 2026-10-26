#!/usr/bin/env node
// Mirror Leonxlnx/taste-skill into this repo as a Claude plugin.
// Usage: node .github/scripts/mirror.mjs <upstream-checkout-dir>
//
// Differences from a raw copy:
//   1. Skill folder is renamed to the `name` in its SKILL.md frontmatter.
//   2. .claude-plugin/plugin.json is generated (upstream ships none).
//   3. No marketplace.json is written: this mirror is intentionally not a
//      marketplace, so directory crawlers that index marketplace manifests skip it.
import { readFileSync, writeFileSync, rmSync, mkdirSync, cpSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const UPSTREAM_SKILL_DIR = 'skills/taste-skill';

const up = process.argv[2];
if (!up) { console.error('usage: mirror.mjs <upstream-dir>'); process.exit(2); }

// Skill name from frontmatter. Upstream CI already guarantees valid kebab-case.
const skillMd = readFileSync(join(up, UPSTREAM_SKILL_DIR, 'SKILL.md'), 'utf8');
const frontmatter = skillMd.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
const skillName = frontmatter.match(/^name:\s*([a-z0-9-]+)\s*$/m)?.[1];
if (!skillName) throw new Error('could not read skill name from SKILL.md frontmatter');

// Plugin metadata comes from upstream's Claude marketplace entry (single source of truth).
const upMarket = JSON.parse(readFileSync(join(up, '.claude-plugin/marketplace.json'), 'utf8'));
const p = upMarket.plugins.find((x) => x.name === 'taste-skill') ?? upMarket.plugins[0];

// Clean previously mirrored content, then copy fresh.
for (const d of ['skills', '.claude-plugin', 'LICENSE']) rmSync(d, { recursive: true, force: true });
mkdirSync('skills', { recursive: true });
mkdirSync('.claude-plugin', { recursive: true });
cpSync(join(up, UPSTREAM_SKILL_DIR), join('skills', skillName), { recursive: true });
cpSync(join(up, 'LICENSE'), 'LICENSE');

const write = (f, o) => writeFileSync(f, JSON.stringify(o, null, 2) + '\n');

write('.claude-plugin/plugin.json', {
  name: p.name,
  version: p.version,
  description: p.description,
  author: p.author,
  homepage: p.homepage,
  repository: p.repository,
  license: p.license,
  keywords: p.keywords,
  // skills/ is auto-discovered from the plugin root; no explicit path needed.
});

const sha = execFileSync('git', ['-C', up, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
writeFileSync('UPSTREAM_SHA', sha + '\n');
console.log(`mirrored ${p.name}@${p.version} (skill: ${skillName}) from ${sha.slice(0, 7)}`);
