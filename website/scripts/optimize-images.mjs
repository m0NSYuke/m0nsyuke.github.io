#!/usr/bin/env node
// Regenerates responsive AVIF/WebP variants in public/assets from the PNG masters in art-source.
// Run manually after changing artwork: `node scripts/optimize-images.mjs`. Not part of the Pages build.
import sharp from 'sharp';
import {mkdirSync,statSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const src=name=>resolve(root,'art-source',name);
const out=resolve(root,'public/assets/img');
mkdirSync(out,{recursive:true});

// name -> widths to emit; square art is cropped to a square, banners keep their ratio.
const plan={
  'hero-sculpture':[360,440,560,800,1120],
  'featured-morph':[640,960,1280,1800],
  'note-wave':[160,480,800],
  'note-architecture':[160,480,800],
  'note-spiral':[160,480,800],
  'wycx-logo':[96,192,480],
};
const manifest={};
for(const [name,widths] of Object.entries(plan)) {
  const meta=await sharp(src(`${name}.png`)).metadata();
  manifest[name]={width:meta.width,height:meta.height,widths};
  for(const width of widths) {
    const base=sharp(src(`${name}.png`)).resize({width,withoutEnlargement:true});
    // Thumbnails are tiny on screen, so they tolerate stronger compression.
    const small=width<=160;
    await base.clone().avif({quality:small?42:36,effort:7}).toFile(resolve(out,`${name}-${width}.avif`));
    await base.clone().webp({quality:small?60:66,effort:6}).toFile(resolve(out,`${name}-${width}.webp`));
  }
}
// Icons
await sharp(src('wycx-logo.png')).resize(180,180,{fit:'contain',background:'#121110'}).flatten({background:'#121110'}).png({compressionLevel:9,palette:true}).toFile(resolve(root,'public/apple-touch-icon.png'));
for(const size of [192,512]) await sharp(src('wycx-logo.png')).resize(Math.round(size*.72)).extend({top:Math.round(size*.14),bottom:size-Math.round(size*.72)-Math.round(size*.14),left:Math.round(size*.14),right:size-Math.round(size*.72)-Math.round(size*.14),background:'#121110'}).flatten({background:'#121110'}).png({compressionLevel:9,palette:true}).toFile(resolve(root,`public/icon-${size}.png`));
writeFileSync(resolve(root,'src/generated-images.json'),JSON.stringify(manifest,null,2)+'\n');
for(const name of Object.keys(plan)) for(const width of plan[name]) for(const ext of ['avif','webp']) {
  const file=`${name}-${width}.${ext}`;console.log(file.padEnd(32),(statSync(resolve(out,file)).size/1024).toFixed(1),'KB');
}
