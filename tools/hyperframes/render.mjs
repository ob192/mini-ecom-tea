/*
  render.mjs — build the three ad cuts from one composition and one catalogue.

    node render.mjs                 # all three formats
    node render.mjs 9x16            # just one
    node render.mjs --snapshot      # PNG stills instead of video, for review

  Each format gets a generated project directory under build/, holding an
  index.html written by composition.mjs and a symlink to the shared assets, and
  is rendered with the project-local HyperFrames CLI. The MP4s land in
  assets/media/ads/, which is git-ignored: these are creative the owner uploads to
  Meta, not files the site serves.

  The price and the seven names are read from apps/web/public/products.json on every
  run, so a cut cannot outlive the catalogue it quotes.
*/

import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, symlinkSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildVariables, REPO } from './catalogue.mjs';
import { buildHtml, FORMATS, TOTAL_SECONDS } from './composition.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ASSETS = resolve(HERE, 'assets');
const BUILD = resolve(HERE, 'build');
const OUT = resolve(REPO, 'assets/media/ads');

const args = process.argv.slice(2);
const snapshot = args.includes('--snapshot');
const wanted = args.filter((a) => !a.startsWith('--'));
const formats = wanted.length ? wanted : Object.keys(FORMATS);

for (const f of formats) {
  if (!FORMATS[f]) {
    console.error(`unknown format "${f}" — known: ${Object.keys(FORMATS).join(', ')}`);
    process.exit(64);
  }
}

if (!existsSync(ASSETS) || readdirSync(ASSETS).length === 0) {
  console.error('assets/ is empty — run ./prepare-assets.sh first.');
  process.exit(1);
}

const vars = buildVariables();
const seconds = TOTAL_SECONDS(vars.teas.length);

console.log(
  `catalogue: ${vars.count} teas, ${vars.totalGrams} г, ${vars.price} ₴, ` +
    `free delivery from ${vars.freeDeliveryFrom} ₴  —  ${seconds.toFixed(2)}s cut`,
);

mkdirSync(OUT, { recursive: true });

for (const format of formats) {
  const dir = resolve(BUILD, format);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'index.html'), buildHtml({ format, vars }), 'utf8');
  // Symlink rather than copy: ~5 MB of photography, three times, rebuilt on
  // every run, is pure waste and makes it ambiguous which copy is current.
  symlinkSync(ASSETS, resolve(dir, 'assets'), 'dir');

  const { w, h } = FORMATS[format];
  if (snapshot) {
    console.log(`\n--- ${format} (${w}x${h}) snapshots ---`);
    run(['snapshot', dir, '--output', resolve(OUT, `stills-${format}`)]);
    continue;
  }

  const target = resolve(OUT, `jintea-start-set-${format}.mp4`);
  console.log(`\n--- ${format} (${w}x${h}) -> ${target} ---`);
  run([
    'render',
    dir,
    '--output', target,
    '--fps', '30',
    '--quality', 'delivery',
    // Meta re-encodes everything on upload, so the job here is to hand it a
    // clean high-bitrate master rather than to be small.
    '--max-bitrate', '12M',
    '--gpu',
    '--quiet',
  ]);
}

function run(argv) {
  execFileSync(resolve(HERE, 'node_modules/.bin/hyperframes'), argv, {
    stdio: 'inherit',
    cwd: HERE,
  });
}
