import { useEffect, useRef, useState } from 'react'

const LABELS={cityRacer:['🏎️','CITY RACER'],fireflyTrail:['✨','FIREFLY TRAIL'],crystalHorn:['💎','CRYSTAL HORN'],starRacer:['🌟','STAR RACER']}
export default function EquippedRewardEffects(){
 const [equipped,setEquipped]=useState(()=>localStorage.getItem('carkeys-equipped-reward')||'');const audio=useRef(null)
 useEffect(()=>{const sync=e=>setEquipped(e.detail||'');window.addEventListener('carkeys-equip',sync);return()=>window.removeEventListener('carkeys-equip',sync)},[])
 useEffect(()=>{if(!equipped)return;document.documentElement.dataset.carkeysReward=equipped;return()=>delete document.documentElement.dataset.carkeysReward},[equipped])
 useEffect(()=>{if(equipped!=='crystalHorn')return;const play=e=>{if(!e.target.closest?.('.controller button'))return;try{const C=window.AudioContext||window.webkitAudioContext;audio.current=audio.current||new C();const c=audio.current,o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.setValueAtTime(523.25,c.currentTime);o.frequency.exponentialRampToValueAtTime(784,c.currentTime+.16);g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.08,c.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.3);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.31)}catch{}};document.addEventListener('pointerdown',play,true);return()=>document.removeEventListener('pointerdown',play,true)},[equipped])
 if(!equipped)return null
 const [icon,name]=LABELS[equipped]||['★','REWARD']
 return <><div className={'equipped-reward-effect '+equipped} aria-hidden="true">{(equipped==='fireflyTrail'||equipped==='starRacer')&&Array.from({length:9},(_,i)=><i key={i} style={{'--i':i}}>{equipped==='starRacer'?(i%2?'✦':'★'):'•'}</i>)}</div><div className="equipped-chip">{icon} {name}</div></>
}
