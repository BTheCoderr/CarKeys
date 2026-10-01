import { useEffect, useMemo, useRef, useState } from 'react'

const NOTES = ['C', 'D', 'E', 'F']
const COLORS = ['#2f8cff', '#f052a0', '#ffd23d', '#47cf62']
const FREQ = [261.63, 293.66, 329.63, 349.23]

const LEVELS = [
  { name:'FOLLOW C', mode:'note', prompt:'FOLLOW C', pattern:[0,0,0,0], keys:1, assist:1 },
  { name:'C OR D?', mode:'note', prompt:'FOLLOW THE NOTE', pattern:[0,1,0,1,1,0], keys:2, assist:1 },
  { name:'THREE LANES', mode:'note', prompt:'READ & DRIVE', pattern:[0,2,1,0,1,2], keys:3, assist:.85 },
  { name:'ALL FOUR', mode:'note', prompt:'READ & DRIVE', pattern:[0,3,1,2,3,0,2], keys:4, assist:.7 },
  { name:'BEAT STREET', mode:'rhythm', prompt:'STAY ON BEAT', pattern:[0,1,2,3,2,1,0], keys:4, assist:.7, beat:650 },
  { name:'QUICK BEAT', mode:'rhythm', prompt:'STAY ON BEAT', pattern:[0,2,0,3,1,2,3,1], keys:4, assist:.55, beat:520 },
  { name:'COPY ME', mode:'memory', prompt:'LISTEN. THEN DRIVE.', pattern:[0,1,2,1,3], keys:4, assist:.5 },
  { name:'LONGER COPY', mode:'memory', prompt:'REMEMBER THE ROAD', pattern:[2,0,3,1,2,3], keys:4, assist:.35 },
  { name:'CITY MELODY', mode:'melody', prompt:'FINISH THE SONG', pattern:[0,0,2,2,3,3,2,1,1,0], keys:4, assist:.3 },
  { name:'NO COLOR HELP', mode:'melody', prompt:'READ THE NOTES', pattern:[0,2,1,3,2,0,3,1], keys:4, assist:0 },
  { name:'RHYTHM RACE', mode:'rhythm', prompt:'READ. BEAT. DRIVE.', pattern:[3,1,2,0,2,3,1,0,3], keys:4, assist:0, beat:470 },
  { name:'MUSIC RUN', mode:'mixed', prompt:'FINISH THE MUSIC RUN', pattern:[0,2,3,1,0,3,2,1,3,0], keys:4, assist:0, beat:500 },
]

let audio
function tone(i, soft=false) {
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)()
    if (audio.state === 'suspended') audio.resume()
    const o=audio.createOscillator(), g=audio.createGain(), now=audio.currentTime
    o.type=soft?'sine':'triangle'; o.frequency.value=FREQ[i]
    g.gain.setValueAtTime(soft?.07:.16,now); g.gain.exponentialRampToValueAtTime(.001,now+.25)
    o.connect(g).connect(audio.destination); o.start(now); o.stop(now+.27)
  } catch {}
}
function sequence(pattern){ pattern.forEach((n,i)=>setTimeout(()=>tone(n,true),i*430)) }

function Road({lane,target,step,total,assist,hit,miss,mode,beatPulse}){
  const ref=useRef(null)
  const laneRef=useRef(lane), targetRef=useRef(target), hitRef=useRef(hit), missRef=useRef(miss), beatRef=useRef(beatPulse)
  useEffect(()=>{laneRef.current=lane},[lane]); useEffect(()=>{targetRef.current=target},[target])
  useEffect(()=>{hitRef.current=hit},[hit]); useEffect(()=>{missRef.current=miss},[miss]); useEffect(()=>{beatRef.current=beatPulse},[beatPulse])
  useEffect(()=>{
    const c=ref.current, x=c.getContext('2d'); let raf, start=performance.now(), car=.5
    const draw=(now)=>{
      const r=c.getBoundingClientRect(), d=Math.min(devicePixelRatio||1,2)
      if(c.width!==Math.floor(r.width*d)||c.height!==Math.floor(r.height*d)){c.width=Math.floor(r.width*d);c.height=Math.floor(r.height*d);x.setTransform(d,0,0,d,0,0)}
      const w=r.width,h=r.height,t=now-start
      x.clearRect(0,0,w,h)
      const sky=x.createLinearGradient(0,0,0,h*.65);sky.addColorStop(0,'#42c9ff');sky.addColorStop(1,'#c8f5ff');x.fillStyle=sky;x.fillRect(0,0,w,h)
      x.fillStyle='#62c956';x.fillRect(0,h*.48,w,h*.52)
      ;['#ff6875','#5a9cff','#ffd44d','#9d5de6','#45c77b','#ff9348'].forEach((q,i)=>{x.fillStyle=q;x.fillRect(i*w/6,h*.48-(55+(i%3)*28),w/6+2,60+(i%3)*28)})
      x.fillStyle='#263f55';x.beginPath();x.moveTo(w*.42,h*.47);x.lineTo(w*.58,h*.47);x.lineTo(w,h);x.lineTo(0,h);x.closePath();x.fill()
      for(let i=1;i<4;i++){x.strokeStyle='rgba(255,255,255,.18)';x.lineWidth=2;x.beginPath();x.moveTo(w*(.42+.16*i/4),h*.47);x.lineTo(w*i/4,h);x.stroke()}
      x.strokeStyle='#fff';x.lineWidth=5;x.setLineDash([24,30]);x.lineDashOffset=(t*.18)%54;x.beginPath();x.moveTo(w*.5,h*.47);x.lineTo(w*.5,h);x.stroke();x.setLineDash([])
      const near=[.18,.39,.61,.82], far=[.445,.482,.518,.555], target=targetRef.current
      if(assist>0){x.save();x.globalAlpha=.08+.18*assist;x.strokeStyle=COLORS[target];x.shadowColor=COLORS[target];x.shadowBlur=25;x.lineWidth=22;x.beginPath();x.moveTo(w*far[target],h*.49);x.lineTo(w*near[target],h);x.stroke();x.restore()}
      const phase=((t%1500)/1500), ty=h*(.49+.19*phase), tx=w*(far[target]+(near[target]-far[target])*phase)
      x.save();x.translate(tx,ty);x.fillStyle=assist>0?COLORS[target]:'#f7f9ff';x.strokeStyle='#fff';x.lineWidth=4;x.shadowColor=assist>0?COLORS[target]:'#fff';x.shadowBlur=16;x.beginPath();x.arc(0,0,25+phase*8,0,Math.PI*2);x.fill();x.stroke();x.fillStyle=assist>0?'#fff':'#17324f';x.font='900 22px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(NOTES[target],0,1);x.restore()
      if(mode==='rhythm'||mode==='mixed'){const age=now-beatRef.current,p=Math.min(1,age/500);x.save();x.globalAlpha=1-p;x.strokeStyle='#fff';x.lineWidth=7;x.beginPath();x.arc(w*.5,h*.62,35+p*70,0,Math.PI*2);x.stroke();x.restore()}
      const desired=near[laneRef.current];car+=(desired-car)*.13
      const hitAge=now-hitRef.current, jump=hitAge<330?Math.sin(hitAge/330*Math.PI)*16:0
      x.save();x.translate(w*car,h*.82-jump);x.fillStyle='#1d9cf0';x.shadowColor='#1d9cf0';x.shadowBlur=14;x.beginPath();x.roundRect(-55,-35,110,65,22);x.fill();x.fillStyle='#bfeeff';x.beginPath();x.roundRect(-30,-31,60,27,13);x.fill();x.fillStyle='#153b60';x.beginPath();x.arc(-13,-18,5,0,7);x.arc(13,-18,5,0,7);x.fill();x.strokeStyle='#123a5e';x.lineWidth=3;x.beginPath();x.arc(0,2,15,.2,Math.PI-.2);x.stroke();x.fillStyle='#fff27c';x.beginPath();x.arc(-39,4,7,0,7);x.arc(39,4,7,0,7);x.fill();x.restore()
      const missAge=now-missRef.current;if(missAge<220){x.fillStyle=`rgba(255,70,80,${.2*(1-missAge/220)})`;x.fillRect(0,0,w,h)}
      x.fillStyle='rgba(0,0,0,.38)';x.fillRect(18,18,w-36,8);x.fillStyle='#ffd43d';x.fillRect(18,18,(w-36)*(step/total),8)
      raf=requestAnimationFrame(draw)
    };raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf)
  },[assist,mode,step,total])
  return <canvas ref={ref} style={{width:'100%',height:'100%',display:'block'}}/>
}

export default function RebootApp(){
  const saved=Math.min(LEVELS.length-1,Number(localStorage.getItem('carkeys-reboot-level')||0))
  const [screen,setScreen]=useState('home'),[level,setLevel]=useState(saved),[step,setStep]=useState(0),[lane,setLane]=useState(1)
  const [hit,setHit]=useState(0),[miss,setMiss]=useState(0),[won,setWon]=useState(false),[listening,setListening]=useState(false),[beatPulse,setBeatPulse]=useState(0)
  const L=LEVELS[level], target=L.pattern[Math.min(step,L.pattern.length-1)]
  const hidden=useMemo(()=>L.mode==='memory'&&listening,[L.mode,listening])

  useEffect(()=>{
    if(screen!=='play'||won) return
    if(L.mode==='memory'&&step===0){setListening(true);sequence(L.pattern);const id=setTimeout(()=>setListening(false),L.pattern.length*430+250);return()=>clearTimeout(id)}
    if(L.mode!=='memory'){const id=setTimeout(()=>tone(target,true),180);return()=>clearTimeout(id)}
  },[screen,level,won])
  useEffect(()=>{
    if(screen!=='play'||won||!(L.mode==='rhythm'||L.mode==='mixed')) return
    const tick=()=>setBeatPulse(performance.now());tick();const id=setInterval(tick,L.beat||520);return()=>clearInterval(id)
  },[screen,level,won,L.mode,L.beat])

  function start(){setStep(0);setLane(1);setWon(false);setScreen('play')}
  function press(i){if(won||hidden||i>=L.keys)return;tone(i);if(i!==target){setMiss(performance.now());navigator.vibrate?.(8);return}setLane(i);setHit(performance.now());navigator.vibrate?.(12);const n=step+1;setStep(n);if(n>=L.pattern.length){setWon(true);localStorage.setItem('carkeys-reboot-level',String(Math.min(level+1,LEVELS.length-1)));[0,1,2,3].forEach((q,j)=>setTimeout(()=>tone(q),j*100))}}
  function next(){if(level===LEVELS.length-1){setScreen('complete');return}setLevel(v=>v+1);setStep(0);setLane(1);setWon(false);setListening(false)}

  if(screen==='home')return <main style={S.page}><section style={S.hero}><div style={S.logo}>♪ CarKeys</div><h1 style={S.h1}>PLAY THE KEYS.<br/>DRIVE THE MUSIC.</h1><p style={S.p}>Notes become lanes. Rhythm becomes speed. Songs become roads.</p><button style={S.primary} onClick={start}>{saved?'CONTINUE':'PLAY'} ▶</button><small style={S.small}>Music learning is the driving game.</small></section></main>
  if(screen==='complete')return <main style={S.page}><section style={S.hero}><div style={{fontSize:56}}>★ ♪ ★</div><h1 style={S.h1}>MUSIC RUN COMPLETE!</h1><p style={S.p}>You drove notes, rhythm, memory and melody.</p><button style={S.primary} onClick={()=>{setLevel(0);setScreen('home')}}>PLAY AGAIN</button></section></main>
  return <main style={S.game}>
    <section style={S.stage}><Road lane={lane} target={target} step={step} total={L.pattern.length} assist={hidden?0:L.assist} hit={hit} miss={miss} mode={L.mode} beatPulse={beatPulse}/><button onClick={()=>setScreen('home')} style={S.home}>⌂</button><div style={S.hud}><b>LEVEL {level+1}</b><span>{L.name}</span></div><div style={S.mission}>{listening?'LISTEN…':L.prompt}</div>{won&&<div style={S.win}><div style={{fontSize:42}}>★</div><h2 style={{margin:'4px 0'}}>NICE DRIVE!</h2><p style={{margin:'0 0 14px'}}>You finished {L.name}.</p><button style={S.primary} onClick={next}>{level===LEVELS.length-1?'FINISH ▶':'NEXT ▶'}</button></div>}</section>
    <section style={S.keys}>{NOTES.map((n,i)=><button key={n} disabled={i>=L.keys||hidden||won} onPointerDown={()=>press(i)} style={{...S.key,background:i>=L.keys?'#9aa7b1':(L.assist>0?COLORS[i]:'#f7f9ff'),color:i>=L.keys?'#dce2e7':(L.assist>0?'#fff':'#17324f'),opacity:hidden?.45:1}}><b>{n}</b><small>{i>=L.keys?'SOON':L.mode==='rhythm'?'BEAT':'NOTE'}</small></button>)}</section>
  </main>
}

const S={page:{minHeight:'100dvh',display:'grid',placeItems:'center',background:'linear-gradient(#45caff,#d6f7ff 55%,#5ed35e 55%)',fontFamily:'Arial,sans-serif',padding:24},hero:{width:'min(560px,92vw)',textAlign:'center',background:'rgba(255,255,255,.92)',borderRadius:34,padding:'42px 24px',boxShadow:'0 20px 60px rgba(16,61,90,.25)'},logo:{fontSize:30,fontWeight:1000,color:'#1678c5'},h1:{fontSize:'clamp(34px,8vw,58px)',lineHeight:.95,color:'#17324f',margin:'22px 0 16px'},p:{fontSize:18,color:'#4b6578',lineHeight:1.45},primary:{border:0,borderRadius:18,padding:'16px 28px',fontSize:20,fontWeight:1000,background:'#ffd43d',color:'#17324f',boxShadow:'0 7px 0 #d4a900',cursor:'pointer'},small:{display:'block',marginTop:24,color:'#688091',fontWeight:700},game:{height:'100dvh',background:'#11283a',display:'grid',gridTemplateRows:'1fr auto',fontFamily:'Arial,sans-serif',overflow:'hidden'},stage:{position:'relative',minHeight:0},home:{position:'absolute',top:40,right:16,width:44,height:44,border:0,borderRadius:14,fontSize:24,background:'rgba(255,255,255,.9)',color:'#17324f'},hud:{position:'absolute',top:42,left:18,display:'grid',color:'#fff',textShadow:'0 2px 5px #17324f',fontSize:13},mission:{position:'absolute',left:'50%',bottom:18,transform:'translateX(-50%)',background:'rgba(18,48,72,.88)',color:'#fff',padding:'10px 18px',borderRadius:999,fontWeight:1000,letterSpacing:1,whiteSpace:'nowrap'},keys:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,padding:'10px max(10px,env(safe-area-inset-left)) calc(10px + env(safe-area-inset-bottom))',background:'#edf5f8'},key:{minHeight:82,border:'3px solid #fff',borderRadius:18,boxShadow:'0 5px 0 rgba(13,45,65,.25)',fontSize:28,fontWeight:1000,display:'grid',placeItems:'center',padding:8},win:{position:'absolute',inset:'50% auto auto 50%',transform:'translate(-50%,-50%)',width:'min(340px,82vw)',background:'#fff',borderRadius:26,padding:24,textAlign:'center',color:'#17324f',boxShadow:'0 20px 70px rgba(0,0,0,.3)'}}
