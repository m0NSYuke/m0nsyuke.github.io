#!/usr/bin/env node
// Builds the display serif: Noto Serif SC (whose Latin glyphs are Source Serif) subset to the characters
// this site can show, so headings get a real serif on every system without a multi-megabyte font.
// Runs before every build; new notes are picked up automatically.
import {readFileSync, readdirSync, mkdirSync, writeFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import subsetFont from 'subset-font';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const source = require.resolve('@expo-google-fonts/noto-serif-sc/500Medium/NotoSerifSC_500Medium.ttf');
const out = resolve(root, 'public/fonts');

const texts = [];
const read = file => readFileSync(file, 'utf8');
const walk = (dir, filter) => readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
  const path = resolve(dir, entry.name);
  return entry.isDirectory() ? walk(path, filter) : filter(entry.name) ? [path] : [];
});
// Interface strings (the admin workbench uses the sans face only).
for (const file of walk(resolve(root, 'src'), name => /\.(jsx?|json)$/.test(name) && !/^(Admin|Workbench)\.jsx$/.test(name) && !name.startsWith('generated-'))) texts.push(read(file));
// Published notes: metadata, plus headings from the bodies.
for (const file of walk(resolve(root, 'content'), name => /\.(json|md)$/.test(name))) {
  const text = read(file);
  texts.push(file.endsWith('.md') ? text.split('\n').filter(line => /^#{1,6}\s/.test(line) || /^\s*>/.test(line)).join('\n') : text);
}

const cjk = new Set();
for (const char of texts.join('')) if (/[　-〿㐀-鿿＀-￯‐-⁯]/u.test(char)) cjk.add(char);
let ascii = '';
for (let code = 32; code < 127; code++) ascii += String.fromCharCode(code);
const characters = ascii + '·×→←’‘“”' + [...cjk].join('');

const font = await subsetFont(readFileSync(source), characters, {targetFormat: 'woff2'});
mkdirSync(out, {recursive: true});
writeFileSync(resolve(out, 'm0-serif.woff2'), font);
console.log(`Built display serif: ${[...new Set(characters)].length} characters, ${(font.length / 1024).toFixed(1)} KB.`);
