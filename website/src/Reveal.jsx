import {useRef,useState} from 'react';
import {motion,useInView,useReducedMotion} from 'motion/react';

const hidden={opacity:0,y:38,filter:'blur(5px)',scale:.985};
const shown={opacity:1,y:0,filter:'blur(0px)',scale:1};

// Each item observes its own viewport position, including stacked mobile cards.
export default function Reveal({as='div',children,className='',delay=0,...props}) {
  const ref=useRef(null),reduced=useReducedMotion();
  const visible=useInView(ref,{once:true,amount:.18,margin:'0px 0px -48px 0px'});
  const [focused,setFocused]=useState(false);
  const Component=motion[as];
  return <Component {...props} ref={ref} className={className} data-reveal-state={reduced||visible||focused?'visible':'waiting'} initial={reduced?false:hidden} animate={reduced||visible||focused?shown:hidden} onFocusCapture={()=>setFocused(true)} transition={reduced||focused?{duration:0}:{type:'spring',stiffness:105,damping:23,mass:1,delay}}>{children}</Component>;
}
