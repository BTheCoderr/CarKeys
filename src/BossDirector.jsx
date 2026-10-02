import { useEffect, useRef, useState } from 'react'

const BOSSES={
  9:{name:'CITY GRAND PRIX',icon:'🏙️',phases:[['🚦','GATE DASH','Open the city gates',3],['🏎️','RIVAL SPRINT','Catch the blue racer',4],['⚡','TURBO FINISH','Finish with a clean streak',3]],reward:'🏎️ CITY RACER UNLOCKED!',unlock:'cityRacer'},
  14:{name:'FOREST BEAT BATTLE',icon:'🌲',phases:[['🥁','BEAT TRAIL','Keep the forest beat',3],['🐇','BUNNY CHASE','Chase through the rhythm trail',4],['✨','FIREFLY FINALE','Light the finish with music',4]],reward:'✨ FIREFLY TRAIL UNLOCKED!',unlock:'fireflyTrail'},
  19:{name:'MOUNTAIN MEMORY RUN',icon:'🏔️',phases:[['👂','LISTEN UP','Hear the mountain tune',3],['💎','CRYSTAL MEMORY','Play the pattern back',4],['⬇️','DOWNHILL DASH','Race to the valley',5]],reward:'💎 CRYSTAL HORN UNLOCKED!',unlock:'crystalHorn'},
  24:{name:'SPACE CONCERT GRAND PRIX',icon:'🚀',phases:[['🪐','ORBIT RHYTHM','Lock onto the space beat',4],['☄️','COMET CHASE','Catch the comet racer',5],['👂','COSMIC MEMORY','Play the melody back',4],['🎹','FINAL CONCERT','Play the final show',6]],reward:'🌟 STAR RACER + COSMIC TRAIL!',unlock:'starRacer'},
}
const KEY='carkeys-boss-unlocks-v1'
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}}
const save=(id)=>{const next={...read(),[id]:true};localStorage.setItem(KEY,JSON.stringify(next));window.dispatchEvent(new CustomEvent('carkeys-unlocks',{detail:next}));return next}

export default function BossDirector(){
 const [playing,setPlaying]=useState(false),[level,setLevel]=useState(-1),[phase,setPhase]=useState(0),[hits,setHits]=useState(0),[flash,setFlash]=useState(''),[complete,setComplete]=useState(false),[unlocks,setUnlocks]=useState(read);const last=useRef(-1)
 const boss=BOSSES[level],stage=boss?.phases[phase],target=stage?.[3]||1
 useEffect(()=>{const sync=()=>{setPlaying(!!document.querySelector('.play-screen .controller'));const m=(document.querySelector('.hud-copy b')?.textContent||'').match(/LEVEL\s+(\d+)/i);if(m){const n=+m[1]-1;if(n!==last.current){last.current=n;setLevel(n);setPhase(0);setHits(0);setComplete(false);setFlash('')}}};const ob=new MutationObserver(sync);ob.observe(document.body,{subtree:true,childList:true,characterData:true});sync();return()=>ob.disconnect()},[])
 useEffect(()=>{if(!boss||complete)return;const press=e=>{const b=e.target.closest?.('.controller button');if(!b||b.disabled||!playing)return;if(b.classList.contains('hint')){const next=hits+1;setHits(next);setFlash(next>=target?'STAGE CLEAR!':'✓ KEEP GOING!');if(next>=target)setTimeout(()=>{if(phase>=boss.phases.length-1){setComplete(true);setUnlocks(save(boss.unlock));setFlash('🏆 WORLD CLEARED!')}else{setPhase(p=>p+1);setHits(0);setFlash('NEXT STAGE!')}},520)}else setFlash('RECOVER!');setTimeout(()=>setFlash(''),400)};document.addEventListener('pointerdown',press,true);return()=>document.removeEventListener('pointerdown',press,true)},[boss,complete,hits,phase,playing,target])
 if(!playing||!boss)return null
 const pct=Math.min(100,(hits/target)*100),owned=!!unlocks[boss.unlock]
 return <div className={'boss-shell '+(complete?'boss-complete':'')}>
   <div className="boss-banner"><span>{boss.icon}</span><div><small>WORLD FINALE</small><b>{boss.name}</b></div><em>{complete?'★':`${phase+1}/${boss.phases.length}`}</em></div>
   {!complete?<><div className="boss-stage"><span>{stage[0]}</span><div><b>{stage[1]}</b><small>{flash||stage[2]}</small></div></div><div className="boss-bar"><i style={{width:`${pct}%`}}/></div><div className="boss-road-event">{phase===0?'🚦':phase===1?'🏎️':phase===2?'⚡':'🎹'}</div></>:<div className="boss-reward"><strong>🏆 WORLD COMPLETE!</strong><b>{boss.reward}</b><span>★ ★ ★</span><small>{owned?'SAVED TO YOUR GARAGE ✓':'SAVING REWARD…'}</small></div>}
 </div>
}
