import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {motion,useAnimationControls,useReducedMotion} from 'motion/react';
import {MagnifyingGlass,X,ArrowUpRight,ArrowRight} from '@phosphor-icons/react';

const spring={type:'spring',stiffness:420,damping:36,mass:.85};
const directions=[['VLA','Vision → Language → Action'],['WAM','Prediction → Action'],['视频生成','Time → Motion → Generation']];
export default function Search({open,onClose,items,triggerRef}) {
  const dialog=useRef(null),paper=useRef(null),position=useRef(null),input=useRef(null),returnFocus=useRef(null),restoreOverflow=useRef('');
  const controls=useAnimationControls(),reduced=useReducedMotion();
  const [query,setQuery]=useState(''),[ready,setReady]=useState(false);
  const dimension=()=>({width:paper.current.offsetWidth,height:Math.min(paper.current.scrollHeight,window.innerHeight*.82)});
  const collapsed=()=>{
    const target=triggerRef.current?.getBoundingClientRect();const frame=position.current.getBoundingClientRect();
    return {width:target?.width||38,height:target?.height||35,x:(target?.left||window.innerWidth-70)-frame.left,y:(target?.top||28)-frame.top,borderRadius:2};
  };
  useLayoutEffect(()=>{
    let cancelled=false;
    const el=dialog.current;
    setReady(false);
    if(open) {
      setQuery('');
      if(!el.open) {
        returnFocus.current=document.activeElement;restoreOverflow.current=document.body.style.overflow;
        el.showModal();document.body.style.overflow='hidden';
        controls.set({...collapsed(),opacity:1});
      }
      controls.start({...dimension(),x:0,y:0,borderRadius:4,opacity:1,transition:reduced?{duration:0}:spring}).then(()=>{
        if(!cancelled){setReady(true);input.current?.focus({preventScroll:true});}
      });
    } else if(el.open) {
      controls.start({...collapsed(),transition:reduced?{duration:0}:spring}).then(()=>{
        if(cancelled)return;
        el.close();document.body.style.overflow=restoreOverflow.current;
        (returnFocus.current?.isConnected?returnFocus.current:triggerRef.current)?.focus({preventScroll:true});
      });
    }
    return()=>{cancelled=true;};
  },[open,controls,reduced]);
  useEffect(()=>{
    if(!ready||!open)return;
    const resize=new ResizeObserver(()=>controls.start({...dimension(),transition:reduced?{duration:0}:spring}));
    resize.observe(paper.current);
    return()=>resize.disconnect();
  },[ready,open,controls,reduced]);
  useEffect(()=>()=>{if(dialog.current?.open)document.body.style.overflow=restoreOverflow.current;},[]);
  const normalized=query.trim().toLowerCase();
  const results=normalized?items.filter(item=>`${item.title} ${item.summary} ${item.tag} ${item.body}`.toLowerCase().includes(normalized)).slice(0,7):[];
  const visit=()=>onClose();
  return <dialog ref={dialog} className="search-dialog" aria-labelledby="search-title" onCancel={event=>{event.preventDefault();onClose();}}>
    <motion.div className="search-backdrop" initial={false} animate={{opacity:open?1:0}} transition={{duration:reduced?0:.35}} onClick={onClose}/>
    <div ref={position} className="search-position">
      <motion.section className="search-shell" initial={{opacity:0}} animate={controls}>
        <motion.div className="search-transit-icon" style={{left:10,top:7}} animate={open?{x:22,y:125,rotate:0,scale:1}:{x:0,y:0,rotate:-18,scale:.9}} transition={reduced?{duration:0}:spring} aria-hidden="true"><MagnifyingGlass size={22}/></motion.div>
        <motion.div ref={paper} className="search-paper" initial={false} animate={{opacity:open?1:0}} transition={{duration:reduced?0:.16,delay:open && !reduced ? .14 : 0}}>
          <header className="search-heading"><div><span className="eyebrow">THE INDEX / m0NSYuke</span><h2 id="search-title">A curious mind.</h2></div><button onClick={onClose} aria-label="关闭搜索"><X size={24}/></button></header>
          <div className="search-field"><input ref={input} type="search" aria-label="搜索关键词" placeholder="Search ideas, notes & possibilities…" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&results[0]){window.location.hash=`${results[0].kind}/${results[0].id}`;onClose();}}}/><span className="mono">↵</span></div>
          <div className="search-body">{normalized?<><div className="search-section-label mono"><span>SEARCH RESULTS</span><span>{results.length} FOUND</span></div>{results.length?results.map((item,index)=><a className="search-result" key={item.id} href={`#${item.kind}/${item.id}`} onClick={visit}><span className="mono search-result-number">{String(index+1).padStart(2,'0')}</span><div><span className="eyebrow">{item.tag} / {item.section==='foundation'?'基础知识':item.kind==='article'?'技术博客':item.kind==='project'?'项目':'日志'}</span><h3>{item.title}</h3><p>{item.summary}</p></div><ArrowUpRight size={21}/></a>):<div className="search-no-results"><h3>还没有这条线索。</h3><p>试试 VLA、WAM、视频生成，或输入更短的关键词。</p></div>}</>:<>
            <div className="search-section-label mono"><span>FOLLOW A THREAD</span><span>03 DIRECTIONS</span></div>
            <div className="search-directions">{directions.map(([name,caption],i)=><button key={name} onClick={()=>{setQuery(name);input.current?.focus();}}><span className="mono">0{i+1}</span><strong>{name}</strong><small className="mono">{caption}</small><ArrowUpRight size={19}/></button>)}</div>
            <div className="search-jumps"><a href="#notes" onClick={visit}>知识与笔记 <ArrowRight size={17}/></a><a href="#works" onClick={visit}>项目 <ArrowRight size={17}/></a><a href="#about" onClick={visit}>关于与联系 <ArrowRight size={17}/></a></div>
          </>}</div>
          <footer className="search-status mono"><span>探索我的知识与思考</span><span>ESC CLOSE · TAB SELECT · ↵ OPEN</span></footer>
        </motion.div>
      </motion.section>
    </div>
  </dialog>;
}
