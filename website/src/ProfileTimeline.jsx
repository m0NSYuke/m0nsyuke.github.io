import {useRef} from 'react';
import {motion,useReducedMotion,useScroll,useSpring} from 'motion/react';
import {Circle} from '@phosphor-icons/react';
import Reveal from './Reveal';

export default function ProfileTimeline({settings,compact=false}) {
  const ref=useRef(null),reduced=useReducedMotion();
  const {scrollYProgress}=useScroll({target:ref,offset:['start 85%','end 75%']});
  const progress=useSpring(scrollYProgress,{stiffness:110,damping:27});
  const entries=[
    ...(settings.university?[{id:'education',label:settings.educationPeriod||'教育',caption:'EDUCATION',title:settings.university,subtitle:settings.major||'',body:compact?'':null}]:[]),
    {id:'research',label:'研究',caption:'RESEARCH',title:compact?'VLA · WAM':'VLA · WAM · 视频生成',subtitle:compact?'视频生成':'感知 / 预测 / 行动',body:settings.bio}
  ];
  return <div ref={ref} className={`profile-timeline ${compact?'compact':''}`} aria-label="教育与研究方向">
    <div className="profile-rail" aria-hidden="true"><motion.span style={{scaleY:reduced?1:progress}}/></div>
    <ol role="list">{entries.map((entry,index)=><Reveal as="li" role="listitem" key={entry.id} className="profile-row" delay={index*.1}>
      <div className="profile-label"><span>{entry.label}</span>{!compact&&<small>{entry.caption}</small>}</div>
      <span className={`profile-node ${index===0?'primary':''}`} aria-hidden="true"><Circle size={12} weight={index===0?'fill':'regular'}/></span>
      <div className="profile-detail"><h3 aria-label={entry.title}>{!compact&&entry.id==='research'?<><span className="profile-topic-line">VLA · WAM</span><span className="profile-title-dot"> · </span><span className="profile-topic-line">视频生成</span></>:entry.title}</h3>{entry.subtitle&&<p className="profile-subtitle">{entry.subtitle}</p>}{entry.body&&<p className="profile-description">{entry.body}</p>}</div>
    </Reveal>)}</ol>
  </div>;
}
