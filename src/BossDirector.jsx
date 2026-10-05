import { useEffect, useState } from 'react'

const BOSSES={
  9:{name:'CITY GRAND PRIX',icon:'🏙️',reward:'🏎️ CITY RACER UNLOCKED!',unlock:'cityRacer'},
  14:{name:'FOREST BEAT BATTLE',icon:'🌲',reward:'✨ FIREFLY TRAIL UNLOCKED!',unlock:'fireflyTrail'},
  19:{name:'MOUNTAIN MEMORY RUN',icon:'🏔️',reward:'💎 CRYSTAL HORN UNLOCKED!',unlock:'crystalHorn'},
  24:{name:'SPACE CONCERT GRAND PRIX',icon:'🚀',reward:'🌟 STAR RACER + COSMIC TRAIL!',unlock:'starRacer'},
}
const KEY='carkeys-boss-unlocks-v1'
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}}
const save=(id)=>{const next={...read(),[id]:true};localStorage.setItem(KEY,JSON.stringify(next));window.dispatchEvent(new CustomEvent('carkeys-unlocks',{detail:next}));return next}

export default function BossDirector(){
 const [playing,setPlaying]=useState(false),[level,setLevel]=useState(-1),[won,setWon]=useState(false),[unlocks,setUnlocks]=useState(read)
 const boss=BOSSES[level]
 useEffect(()=>{const sync=()=>{const play=!!document.querySelector('.play-screen .controller');setPlaying(play);const m=(document.querySelector('.hud-copy b')?.textContent||'').match(/LEVEL\s+(\d+)/i);const n=m?+m[1]-1:-1;setLevel(n);setWon(!!document.querySelector('.win-card'))};const ob=new MutationObserver(sync);ob.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true});sync();return()=>ob.disconnect()},[])
 useEffect(()=>{if(!playing||!boss||!won||unlocks[boss.unlock])return;setUnlocks(save(boss.unlock))},[playing,boss,won,unlocks])
 if(!playing||!boss)return null
 const owned=!!unlocks[boss.unlock]
 return <div className={'boss-shell '+(won?'boss-complete':'')}>
   <div className="boss-banner"><span>{boss.icon}</span><div><small>WORLD FINALE</small><b>{boss.name}</b></div><em>{won?'★':'GO!'}</em></div>
   {won&&<div className="boss-reward"><strong>🏆 WORLD COMPLETE!</strong><b>{boss.reward}</b><span>★ ★ ★</span><small>{owned?'SAVED TO YOUR GARAGE ✓':'SAVING REWARD…'}</small></div>}
 </div>
}
