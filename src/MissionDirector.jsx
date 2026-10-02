import { useEffect, useMemo, useRef, useState } from 'react'

const TYPES=['collect','race','gates','rhythm','choice','chase','memory','collect','race','finale','rhythm','gates','chase','choice','finale','memory','race','collect','gates','finale','chase','rhythm','choice','memory','finale']
const META={
 collect:{icon:'⭐',title:'COLLECT RUN',verb:'Collect the road stars'},race:{icon:'🏁',title:'RIVAL RACE',verb:'Keep your streak to catch the rival'},gates:{icon:'🚦',title:'GATE RUN',verb:'Play clean notes to open the gates'},rhythm:{icon:'🥁',title:'RHYTHM RUN',verb:'Hit the notes and hold the groove'},choice:{icon:'↗',title:'ROUTE PICK',verb:'Earn a shortcut and choose the fast road'},chase:{icon:'🏎️',title:'CHASE',verb:'Follow the music and catch the car'},memory:{icon:'👂',title:'MEMORY CHASE',verb:'Listen first, then drive it back'},finale:{icon:'🎵',title:'WORLD FINALE',verb:'Put the whole world together'},
}
export default function MissionDirector(){
 const [playing,setPlaying]=useState(false),[level,setLevel]=useState(0),[hits,setHits]=useState(0),[misses,setMisses]=useState(0),[flash,setFlash]=useState('');const last=useRef(-1)
 const type=TYPES[level]||'collect',meta=META[type],target=type==='finale'?6:type==='race'||type==='chase'?5:4
 const progress=Math.min(target,hits)
 useEffect(()=>{const sync=()=>{setPlaying(Boolean(document.querySelector('.play-screen .controller')));const m=(document.querySelector('.hud-copy b')?.textContent||'').match(/LEVEL\s+(\d+)/i);if(m){const n=+m[1]-1;if(n!==last.current){last.current=n;setLevel(n);setHits(0);setMisses(0);setFlash('')}}};const ob=new MutationObserver(sync);ob.observe(document.body,{childList:true,subtree:true,characterData:true});sync();return()=>ob.disconnect()},[])
 useEffect(()=>{const press=e=>{const b=e.target.closest?.('.controller button');if(!b||b.disabled||!playing)return;if(b.classList.contains('hint')){setHits(v=>v+1);if(type==='collect')setFlash('⭐ GOT IT!');else if(type==='gates')setFlash('🚦 GATE OPEN!');else if(type==='race')setFlash('💨 CLOSING IN!');else if(type==='chase')setFlash('🏎️ KEEP CHASING!');else if(type==='choice'&&hits+1>=3)setFlash('↗ SHORTCUT READY!');else if(type==='finale')setFlash('🎵 SHOWTIME!');else setFlash('✓ NICE!')}else{setMisses(v=>v+1);setFlash(type==='race'||type==='chase'?'RIVAL PULLS AHEAD…':'KEEP GOING!')}setTimeout(()=>setFlash(''),450)};document.addEventListener('pointerdown',press,true);return()=>document.removeEventListener('pointerdown',press,true)},[playing,type,hits])
 if(!playing)return null
 return <div className={`mission-director mission-${type}`}>
   <div className="mission-icon">{meta.icon}</div><div className="mission-text"><b>{meta.title}</b><small>{flash||meta.verb}</small></div>
   <div className="mission-meter">{Array.from({length:target},(_,i)=><i key={i} className={i<progress?'done':''}/>)}</div>
   {(type==='race'||type==='chase')&&<div className="mini-race"><span className="you" style={{left:`${Math.min(78,8+progress/target*70)}%`}}>🚙</span><span className="rival">🏎️</span></div>}
   {type==='choice'&&progress>=3&&<div className="route-choice"><span>ROAD</span><b>↗ SHORTCUT</b></div>}
 </div>
}
