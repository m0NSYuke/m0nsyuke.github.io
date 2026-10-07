import {useState} from 'react';
import {motion,AnimatePresence} from 'motion/react';
import {ArrowUpRight,ArrowRight,ArrowLeft,MagnifyingGlass,List,SquaresFour} from '@phosphor-icons/react';
import {asset} from './api';
import Reveal from './Reveal';

export const directions=[
  {tag:'VLA',name:'感知，理解，行动。',caption:'VISION / LANGUAGE / ACTION',description:'视觉、语言与动作，从基础概念走向模型阅读。'},
  {tag:'WAM',name:'在预测中寻找行动。',caption:'PREDICTION / ACTION',description:'围绕模型定义、状态表示与训练评估，连接问题与笔记。'},
  {tag:'视频生成',name:'让时间拥有形状。',caption:'TIME / MOTION / GENERATION',description:'从图像生成到时序与运动，记录论文和实践中的理解。'}
];
export function DirectionCards({items}) {return <div className="direction-cards">{directions.map((topic,index)=><Reveal as="a" key={topic.tag} href={`#notes/${encodeURIComponent(topic.tag)}`} delay={index*.09}><span className="mono direction-number">0{index+1} / {topic.caption}</span><h3>{topic.tag}<ArrowUpRight size={22}/></h3><p>{topic.description}</p><span className="mono direction-count">{items.filter(i=>i.kind==='article'&&i.tag===topic.tag).length} ENTRIES <ArrowRight size={16}/></span></Reveal>)}</div>;}
export default function Knowledge({items,topic='全部'}) {
  const [filter,setFilter]=useState(topic),[mode,setMode]=useState('foundation'),[view,setView]=useState('cards'),[query,setQuery]=useState('');
  const articles=items.filter(item=>item.kind==='article');
  const data=articles.filter(item=>(item.section||'blog')===mode&&(filter==='全部'||item.tag===filter)&&`${item.title} ${item.summary} ${item.tag}`.toLowerCase().includes(query.trim().toLowerCase()));
  const tags=[...new Set([...directions.map(t=>t.tag),...articles.map(i=>i.tag).filter(Boolean)])];
  return <div className="page-content knowledge-page"><a href="#" className="back-link"><ArrowLeft size={18}/> 返回工作台</a><div className="page-heading"><div><span className="eyebrow">A CONNECTED BODY OF KNOWLEDGE</span><h1>让理解，形成连接。</h1><p>VLA、WAM 与视频生成。基础知识是地图，技术笔记是走过的路。</p></div><span className="mono subtle">KNOWLEDGE / NOTES</span></div>
    <div className="knowledge-modes"><div className="tabs" aria-label="阅读分区"><button className={mode==='foundation'?'active':''} aria-pressed={mode==='foundation'} onClick={()=>setMode('foundation')}>基础知识 <span className="mono">{articles.filter(i=>i.section==='foundation').length}</span></button><button className={mode==='blog'?'active':''} aria-pressed={mode==='blog'} onClick={()=>setMode('blog')}>技术博客 <span className="mono">{articles.filter(i=>(i.section||'blog')==='blog').length}</span></button></div><div className="knowledge-views" aria-label="展示方式"><button aria-label="卡片展示" aria-pressed={view==='cards'} onClick={()=>setView('cards')}><SquaresFour size={20}/></button><button aria-label="目录展示" aria-pressed={view==='list'} onClick={()=>setView('list')}><List size={21}/></button></div></div>
    <div className="collection-toolbar"><div className="filter-tabs" aria-label="研究方向">{['全部',...tags].map(tag=><button key={tag} className={filter===tag?'active':''} aria-pressed={filter===tag} onClick={()=>setFilter(tag)}>{tag}</button>)}</div><label className="inline-search"><MagnifyingGlass size={18}/><input aria-label="搜索当前内容" value={query} onChange={e=>setQuery(e.target.value)} placeholder="寻找一条线索…"/></label></div>
    <p className="knowledge-note">{mode==='foundation'?'从基础概念出发，把论文和相关笔记连接到同一方向。':'按方向整理论文阅读、实践记录与自己的技术思考。'}</p>
    <AnimatePresence mode="wait"><motion.div key={`${mode}-${view}-${filter}-${query}`} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} transition={{duration:.18}} className={view==='cards'?'knowledge-grid':'knowledge-index'}>{data.length?data.map((item,index)=><Reveal as="a" href={`#article/${item.id}`} key={item.id} className="knowledge-entry" delay={index%3*.09}><div className="knowledge-entry-art"><img src={asset(item.image||'note-wave.png')} alt="" loading="lazy"/></div><div className="knowledge-entry-copy"><span className="eyebrow">{item.tag} / {mode==='foundation'?'FOUNDATIONS':'NOTES'}</span><h2>{item.title}</h2><p>{item.summary}</p><div className="knowledge-entry-foot"><span className="mono">{view==='list'?`0${index+1} / `:''}{item.sample?'学习框架示例':item.date.replaceAll('-','.')}</span><ArrowUpRight size={20}/></div></div></Reveal>):<div className="knowledge-empty"><span className="serif">Space for the next idea.</span><h2>{query?'还没有匹配的笔记。':mode==='blog'?'下一篇笔记，从这里开始。':'这个方向的知识正在整理。'}</h2><p>{query?'换一个词，或清除搜索条件。':'真实内容发布后，会自动出现在相应方向。'}</p>{query&&<button className="text-button" onClick={()=>setQuery('')}>清除搜索 <ArrowRight size={17}/></button>}</div>}</motion.div></AnimatePresence>
  </div>;
}
