#!/usr/bin/env node
// After `vite build`: per-article share pages with their own title and Open Graph tags,
// sitemap.xml, robots.txt and a 404 page. The app keeps hash routing; each share page
// carries the article text for crawlers and forwards visitors to #article/<id>.
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Marked} from 'marked';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dist=resolve(root,'dist/client');
const site=(process.env.SITE_URL||'https://m0nsyuke.github.io').replace(/\/$/,'');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const data=JSON.parse(readFileSync(resolve(dist,'data/content.json'),'utf8'));
const shell=readFileSync(resolve(dist,'index.html'),'utf8');

function withMeta(html,{title,description,url,type='website'}) {
  const replace=(pattern,value)=>{html=html.replace(pattern,value);};
  replace(/<title>[^<]*<\/title>/,`<title>${escape(title)}</title>`);
  replace(/(<meta name="description" content=")[^"]*/,`$1${escape(description)}`);
  replace(/(<link rel="canonical" href=")[^"]*/,`$1${escape(url)}`);
  replace(/(<meta property="og:type" content=")[^"]*/,`$1${type}`);
  replace(/(<meta property="og:url" content=")[^"]*/,`$1${escape(url)}`);
  replace(/(<meta property="og:title" content=")[^"]*/,`$1${escape(title)}`);
  replace(/(<meta property="og:description" content=")[^"]*/,`$1${escape(description)}`);
  replace(/(<meta name="twitter:title" content=")[^"]*/,`$1${escape(title)}`);
  replace(/(<meta name="twitter:description" content=")[^"]*/,`$1${escape(description)}`);
  return html;
}

const parser=new Marked();
const pages=[];
for(const item of data.items.filter(entry=>entry.kind==='article')) {
  const url=`${site}/notes/${item.id}/`;
  const title=`${item.title} · m0NSYuke`;
  let html=withMeta(shell,{title,description:item.summary,url,type:'article'});
  // Forward people to the app route; crawlers read the article below.
  html=html.replace('<script>',`<script>location.replace('/#article/${item.id}'+(location.hash?'/'+location.hash.slice(1):''));</script>\n    <meta property="article:published_time" content="${item.date}" />\n    <script>`);
  const body=parser.parse(item.body.replace(/^#\s+.*\n/,''));
  html=html.replace('<div id="root"></div>',`<div id="root"><article style="max-width:680px;margin:48px auto;padding:0 20px"><h1>${escape(item.title)}</h1><p>${escape(item.summary)}</p>${body}</article></div>`);
  mkdirSync(resolve(dist,'notes',item.id),{recursive:true});
  writeFileSync(resolve(dist,'notes',item.id,'index.html'),html);
  pages.push({url,date:item.date});
}

const latest=data.items.reduce((max,item)=>item.date>max?item.date:max,'2026-01-01');
const urls=[{url:`${site}/`,date:latest},...pages];
writeFileSync(resolve(dist,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(({url,date})=>`  <url><loc>${escape(url)}</loc><lastmod>${date}</lastmod></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(resolve(dist,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);
writeFileSync(resolve(dist,'404.html'),withMeta(shell,{title:'页面不存在 · m0NSYuke',description:'这个地址没有内容。',url:`${site}/`}).replace('<meta charset="UTF-8" />','<meta charset="UTF-8" />\n    <meta name="robots" content="noindex" />'));
console.log(`Prepared ${pages.length} share pages, sitemap.xml, robots.txt and 404.html.`);
