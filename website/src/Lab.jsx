import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Pause, Play, ArrowCounterClockwise } from '@phosphor-icons/react';

export default function Lab({ reduced = false }) {
  const mount = useRef(null), parameters = useRef({amplitude:.65,frequency:2,speed:.25,paused:reduced});
  const [state,setState] = useState(parameters.current), [error,setError] = useState('');
  function update(patch) { const value={...parameters.current,...patch}; parameters.current=value;setState(value); }
  useEffect(()=>{
    const host=mount.current; let renderer;
    try {renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:false});} catch {setError('当前设备无法使用 WebGL。你仍然可以浏览作品与笔记。');return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-label','可拖动旋转的实时金色曲面');renderer.domElement.setAttribute('role','img');
    const scene=new THREE.Scene(); const camera=new THREE.PerspectiveCamera(40,1,.1,100);camera.position.set(5,4,6);
    const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=!reduced;controls.enablePan=false;controls.minDistance=4;controls.maxDistance=14;
    const geometry=new THREE.PlaneGeometry(5,5,44,44);geometry.rotateX(-Math.PI/2);
    const material=new THREE.MeshBasicMaterial({color:'#d5a45d',wireframe:true,transparent:true,opacity:.8});
    const mesh=new THREE.Mesh(geometry,material);scene.add(mesh);
    const original=new Float32Array(geometry.attributes.position.array); let frame,visible=true,time=0,last=performance.now(),previousParameters=null,resized=true;
    const observer=new IntersectionObserver(entries=>visible=entries[0].isIntersecting);observer.observe(host);
    const resize=new ResizeObserver(()=>{const width=host.clientWidth,height=host.clientHeight;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);resized=true;});resize.observe(host);
    function render(now) {
      frame=requestAnimationFrame(render);const dt=Math.min((now-last)/1000,.05);last=now;
      if(!visible || document.hidden) return;
      const p=parameters.current,animate=!p.paused&&p.speed>0,controlsChanged=controls.update();
      if(!animate && p===previousParameters && !controlsChanged && !resized) return;
      if(animate) time+=dt*p.speed;
      const pos=geometry.attributes.position;
      for(let i=0;i<pos.count;i++) {const x=original[i*3],z=original[i*3+2];pos.setY(i,Math.sin(x*p.frequency+time)*Math.cos(z*p.frequency-time)*p.amplitude);}
      pos.needsUpdate=true;mesh.rotation.y=p.paused?mesh.rotation.y:time*.18;renderer.render(scene,camera);previousParameters=p;resized=false;
    }
    frame=requestAnimationFrame(render);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();controls.dispose();geometry.dispose();material.dispose();renderer.dispose();renderer.domElement.remove();};
  },[reduced]);
  useEffect(()=>{if(reduced) update({paused:true});},[reduced]);
  return <section className="live-lab">
    <div className="lab-canvas" ref={mount}>{error&&<p role="status">{error}</p>}<span className="lab-label mono">LIVE / PARAMETRIC SURFACE</span><span className="lab-help">拖动旋转 · 滚轮缩放</span></div>
    <div className="lab-controls">
      <div><span className="eyebrow">EXPERIMENT 001</span><h2>给想法一个形状。</h2><p>改变参数，观察数学如何成为可见的结构。</p></div>
      {[['amplitude','波幅',0,1.5,.05],['frequency','频率',.5,4,.1],['speed','速度',0,1,.05]].map(([key,label,min,max,step])=><label key={key} className="range-label"><span>{label}<output>{state[key].toFixed(2)}</output></span><input aria-label={label} type="range" min={min} max={max} step={step} value={state[key]} onChange={e=>update({[key]:Number(e.target.value)})}/></label>)}
      <div className="lab-actions"><button className="outline-button" onClick={()=>update({paused:!state.paused})}>{state.paused?<Play size={16}/>:<Pause size={16}/>} {state.paused?'继续':'暂停'}</button><button className="text-button" onClick={()=>update({amplitude:.65,frequency:2,speed:.25,paused:reduced})}><ArrowCounterClockwise size={16}/> 重置参数</button></div>
      <p className="subtle small">实时渲染 · 不是预录制影像</p>
    </div>
  </section>;
}
