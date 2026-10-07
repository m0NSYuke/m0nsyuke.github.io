import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildPages} from '../scripts/build-pages-content.mjs';

function fixture() {
  const root=mkdtempSync(join(tmpdir(),'wycx-pages-'));
  const content=join(root,'content'),output=join(root,'output');
  mkdirSync(join(content,'published'),{recursive:true});
  mkdirSync(join(content,'drafts'));
  writeFileSync(join(content,'profile.json'),JSON.stringify({name:'m0NSYuke',tagline:'Learning',description:'VLA',bio:'Notes',github:'',email:'',university:'四川大学',major:'自动化',educationPeriod:'',xiaohongshu:'',privateValue:'DO_NOT_EXPORT'}));
  const entry={id:'vla-test',kind:'article',section:'blog',title:'VLA & <action>',summary:'A < B',tag:'VLA',date:'2026-10-08',image:'note-wave.png',status:'published',sample:false};
  writeFileSync(join(content,'published','vla-test.json'),JSON.stringify(entry));
  writeFileSync(join(content,'published','vla-test.md'),'# Public note\n\nEditable markdown.');
  writeFileSync(join(content,'drafts','secret.md'),'PRIVATE_DRAFT');
  return {root,content,output,entry};
}
test('Pages exports published Markdown and public profile fields, and escapes RSS',()=>{
  const f=fixture();
  try {
    const data=buildPages({contentRoot:f.content,outputRoot:f.output,siteUrl:'https://m0nsyuke.github.io'});
    assert.equal(data.items[0].body,'# Public note\n\nEditable markdown.');
    assert.equal(data.settings.privateValue,undefined);
    const json=readFileSync(join(f.output,'data','content.json'),'utf8');
    assert.ok(!json.includes('PRIVATE_DRAFT')&&!json.includes('DO_NOT_EXPORT'));
    const rss=readFileSync(join(f.output,'rss.xml'),'utf8');
    assert.ok(rss.includes('VLA &amp; &lt;action&gt;'));
    assert.ok(rss.includes('https://m0nsyuke.github.io/#article/vla-test'));
  } finally {rmSync(f.root,{recursive:true,force:true});}
});
test('Pages fails the build if a draft is placed in the public source directory',()=>{
  const f=fixture();
  try {
    writeFileSync(join(f.content,'published','vla-test.json'),JSON.stringify({...f.entry,status:'draft'}));
    assert.throws(()=>buildPages({contentRoot:f.content,outputRoot:f.output}),/explicitly published/);
  } finally {rmSync(f.root,{recursive:true,force:true});}
});
test('Pages rejects content IDs that could reference files outside the article directory',()=>{
  const f=fixture();
  try {
    writeFileSync(join(f.content,'published','vla-test.json'),JSON.stringify({...f.entry,id:'../secret'}));
    assert.throws(()=>buildPages({contentRoot:f.content,outputRoot:f.output}),/Invalid content ID/);
  } finally {rmSync(f.root,{recursive:true,force:true});}
});
