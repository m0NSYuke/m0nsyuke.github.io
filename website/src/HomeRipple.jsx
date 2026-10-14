import {useEffect,useRef} from 'react';

// A projected parametric surface, like the Lab, with local pointer-driven waves.
export default function HomeRipple({reduced=false}) {
  const canvasRef=useRef(null);
  useEffect(()=>{
    const canvas=canvasRef.current,host=canvas.parentElement,context=canvas.getContext('2d');
    if(!context)return;
    let width=0,height=0,frame=0,last=0,time=0,visible=true,active=false,hover=0;
    const target={x:.58,y:.65},pointer={...target},wakes=[];
    let previousMove=0,previousX=0,previousY=0;
    const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
    const move=event=>{
      if(event.pointerType==='touch')return;
      const rect=host.getBoundingClientRect();
      if(rect.bottom<0||rect.top>innerHeight)return;
      const now=performance.now();
      target.y=clamp(((event.clientY-rect.top)/rect.height-.39)/.57,0,1);
      target.x=clamp(((event.clientX-rect.left)/rect.width-.5)/(.7+target.y*.48)+.5,0,1);
      active=true;
      const distance=Math.hypot(event.clientX-previousX,event.clientY-previousY);
      if(now-previousMove>75&&distance>5){
        wakes.push({x:(target.x-.5)*14,z:(target.y-.5)*8,born:time,energy:clamp(distance/95,.35,1)});
        if(wakes.length>8)wakes.shift();
        previousMove=now;previousX=event.clientX;previousY=event.clientY;
      }
    };
    const leave=()=>{active=false;target.x=.58;target.y=.65;};
    function draw(now=performance.now()){
      const dt=last?Math.min((now-last)/1000,.06):0;last=now;
      if(!visible||document.hidden)return;
      if(!reduced)time+=dt;
      const easing=1-Math.exp(-dt*5);
      hover+=((active?1:0)-hover)*easing;
      pointer.x+=(target.x-pointer.x)*easing;pointer.y+=(target.y-pointer.y)*easing;
      while(wakes.length&&time-wakes[0].born>4.5)wakes.shift();
      context.clearRect(0,0,width,height);
      const columns=width<600?48:80,rows=width<600?23:30,points=[];
      const focusX=(pointer.x-.5)*14,focusZ=(pointer.y-.5)*8;
      if(hover>.01){
        const glowX=width*.5+(pointer.x-.5)*width*(.7+pointer.y*.48),glowY=height*(.39+pointer.y*.57);
        const radius=Math.min(width*.17,190),glow=context.createRadialGradient(glowX,glowY,0,glowX,glowY,radius);
        glow.addColorStop(0,`rgba(213,164,93,${hover*.065})`);glow.addColorStop(1,'rgba(213,164,93,0)');
        context.fillStyle=glow;context.fillRect(0,0,width,height);
      }
      for(let row=0;row<=rows;row++){
        const v=row/rows,z=(v-.5)*8,perspective=.7+v*.48;
        points[row]=[];
        for(let column=0;column<=columns;column++){
          const u=column/columns,x=(u-.5)*14;
          let wave=Math.sin(x*.64+time*.42)*Math.cos(z*.82-time*.32)*.35;
          wave+=Math.sin(x*.35-z*.8+time*.25)*.16;
          const focusDistance=Math.hypot(x-focusX,z-focusZ);
          wave+=Math.exp(-focusDistance*focusDistance*.2)*.95*hover;
          for(const wake of wakes){
            const age=time-wake.born,d=Math.hypot(x-wake.x,z-wake.z);
            wave+=Math.sin(d*3.6-age*5.1)*Math.exp(-Math.pow(d-age*1.65,2)*.65)*Math.exp(-age*.9)*wake.energy*.6;
          }
          points[row][column]={x:width*.5+(u-.5)*width*perspective,y:height*(.39+v*.57)-wave*Math.min(height*.09,47)};
        }
      }
      const path=(line)=>{context.beginPath();line.forEach((p,index)=>index?context.lineTo(p.x,p.y):context.moveTo(p.x,p.y));context.stroke();};
      context.lineWidth=.75;
      for(let row=0;row<=rows;row++){
        const fade=Math.pow(Math.sin(row/rows*Math.PI),.7);
        context.strokeStyle=`rgba(213,164,93,${fade*(row%5===0?.26:.15)})`;
        path(points[row]);
      }
      for(let column=0;column<=columns;column+=2){
        const fade=Math.pow(Math.sin(column/columns*Math.PI),.65);
        context.strokeStyle=`rgba(213,164,93,${fade*.12})`;
        path(points.map(row=>row[column]));
      }
    }
    function loop(now){frame=0;if(now-last>=25)draw(now);if(visible&&!document.hidden&&!reduced)frame=requestAnimationFrame(loop);}
    function resume(){if(frame||!visible||document.hidden||reduced)return;last=0;frame=requestAnimationFrame(loop);}
    function pause(){cancelAnimationFrame(frame);frame=0;last=0;}
    function resize(){
      width=host.clientWidth;height=host.clientHeight;
      const ratio=Math.min(devicePixelRatio||1,1.5);
      canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
      context.setTransform(ratio,0,0,ratio,0,0);draw();resume();
    }
    const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(host);
    const visibilityObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){draw();resume();}else pause();});visibilityObserver.observe(host);
    const visibilityChange=()=>{if(document.hidden)pause();else{draw();resume();}};
    document.addEventListener('visibilitychange',visibilityChange);
    if(!reduced){window.addEventListener('pointermove',move,{passive:true});document.documentElement.addEventListener('pointerleave',leave);window.addEventListener('blur',leave);}
    resize();
    return()=>{pause();sizeObserver.disconnect();visibilityObserver.disconnect();document.removeEventListener('visibilitychange',visibilityChange);window.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',leave);window.removeEventListener('blur',leave);};
  },[reduced]);
  return <div className="home-ripple" aria-hidden="true"><canvas ref={canvasRef}/></div>;
}
