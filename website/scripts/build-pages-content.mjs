import {readFileSync,writeFileSync,readdirSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const textFields=['name','tagline','description','bio','github','email','university','major','educationPeriod','xiaohongshu'];
const images=['','featured-morph.png','hero-sculpture.png','note-wave.png','note-architecture.png','note-spiral.png'];
const xml=value=>String(value).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));

export function compileContent(contentRoot) {
  const profile=read(resolve(contentRoot,'profile.json'));
  if(profile.name!=='m0NSYuke')throw new Error('Profile name must be m0NSYuke.');
  for(const field of textFields)if(typeof profile[field]!=='string'||profile[field].length>2000)throw new Error(`Invalid profile field: ${field}`);
  for(const field of ['github','xiaohongshu'])if(profile[field]&&!/^https:\/\//.test(profile[field]))throw new Error(`Invalid HTTPS profile link: ${field}`);
  const settings=Object.fromEntries(textFields.map(field=>[field,profile[field]]));
  const folder=resolve(contentRoot,'published');
  const items=readdirSync(folder).filter(file=>file.endsWith('.json')).map(file=>{
    const input=read(resolve(folder,file));
    if(!/^[a-z0-9][a-z0-9-]{0,79}$/.test(input.id)||file!==`${input.id}.json`)throw new Error(`Invalid content ID: ${file}`);
    if(!['article','project','log'].includes(input.kind)||!['foundation','blog'].includes(input.section)||input.status!=='published')throw new Error(`Only explicitly published content is allowed: ${file}`);
    for(const field of ['title','summary','tag','date','image'])if(typeof input[field]!=='string')throw new Error(`Invalid ${field}: ${file}`);
    if(!input.title.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(input.date)||Number.isNaN(Date.parse(input.date))||!images.includes(input.image))throw new Error(`Invalid metadata: ${file}`);
    const body=readFileSync(resolve(folder,`${input.id}.md`),'utf8');
    if(body.length>100000)throw new Error(`Article too long: ${file}`);
    return {...Object.fromEntries(['id','kind','section','title','summary','tag','date','image','status'].map(key=>[key,input[key]])),sample:input.sample===true,body};
  }).sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
  return {settings,items};
}

export function buildPages({contentRoot=resolve(root,'content'),outputRoot=resolve(root,'public'),siteUrl=process.env.SITE_URL||'https://m0nsyuke.github.io'}={}) {
  const url=new URL(siteUrl);
  if(url.protocol!=='https:'&&url.hostname!=='localhost'&&url.hostname!=='127.0.0.1')throw new Error('SITE_URL must use HTTPS.');
  const base=siteUrl.replace(/\/$/,'');
  const data=compileContent(contentRoot);
  mkdirSync(resolve(outputRoot,'data'),{recursive:true});
  writeFileSync(resolve(outputRoot,'data/content.json'),JSON.stringify(data));
  const articles=data.items.filter(item=>item.kind==='article');
  writeFileSync(resolve(outputRoot,'rss.xml'),`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>m0NSYuke · 技术笔记</title><link>${xml(base)}</link><description>VLA、WAM 与视频生成的学习笔记。</description>${articles.map(item=>`<item><title>${xml(item.title)}</title><description>${xml(item.summary)}</description><link>${xml(base)}/#article/${xml(item.id)}</link><guid isPermaLink="false">${xml(item.id)}</guid><pubDate>${new Date(item.date).toUTCString()}</pubDate></item>`).join('')}</channel></rss>`);
  writeFileSync(resolve(outputRoot,'.nojekyll'),'');
  return data;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const data=buildPages();
  console.log(`Prepared ${data.items.length} published entries and RSS for GitHub Pages.`);
}
