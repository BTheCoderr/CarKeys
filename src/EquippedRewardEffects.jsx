import { useEffect, useRef, useState } from 'react'

const LABELS={cityRacer:['🏎️','CITY RACER'],fireflyTrail:['✨','FIREFLY TRAIL'],crystalHorn:['💎','CRYSTAL HORN'],starRacer:['🌟','STAR RACER']}
const LANES=[24,41,59,76]
export default function EquippedRewardEffects(){
 const [equipped,setEquipped]=useState(()=>localStorage.getItem('carkeys-equipped-reward')||''),[lane,setLane]=useState(1);const audio=useRef(null)
 useEffect(()=>{const sync=e=>setEquipped(e.detail||'');window.addEventListener('carkeys-equip',sync);return()=>window.removeEventListener('carkeys-equip',sync)},[])
 useEffect(()=>{if(!equipped)return;document.documentElement.dataset.carkeysReward=equipped;return()=>delete document.documentElement.dataset.carkeysReward},[equipped])
 useEffect(()=>{const track=e=>{const buttons=[...document.querySelectorAll('.controller button')],b=e.target.closest?.('.controller button');if(!b)return;const i=buttons.indexOf(b);if(i>=0&&i<4){if(document.querySelector('.free-controller'))setLane(v=>i===0?Math.max(0,v-1):i===1?Math.min(3,v+1):v);else if(b.classList.contains('hint'))setLane(i)}};document.addEventListener('pointerdown',track,true);return()=>document.removeEventListener('pointerdown',track,true)},[])
 useEffect(()=>{if(equipped!=='crystalHorn')return;const play=e=>{if(!e.target.closest?.('.controller button'))return;try{const C=window.AudioContext||window.webkitAudioContext;audio.current=audio.current||new C();const c=audio.current,o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.setValueAtTime(523.25,c.currentTime);o.frequency.exponentialRampToValueAtTime(784,c.currentTime+.16);g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.08,c.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.3);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.31)}catch{}};document.addEventListener('pointerdown',play,true);return()=>document.removeEventListener('pointerdown',play,true)},[equipped])
 if(!equipped)return null
 const [icon,name]=LABELS[equipped]||['★','REWARD'],hero=equipped==='cityRacer'||equipped==='starRacer'
 return <><div className={'equipped-reward-effect '+equipped} style={{'--reward-lane':LANES[lane]+'%'}} aria-hidden="true">{hero&&<div className="reward-hero-car"><div className="reward-spoiler"/><div className="reward-glass"><i/><i/></div><div className="reward-stripes"/><div className="reward-grille"/><span className="reward-wheel left"/><span className="reward-wheel right"/></div>}{(equipped==='fireflyTrail'||equipped==='starRacer')&&Array.from({length:11},(_,i)=><i className="trail-bit" key={i} style={{'--i':i}}>{equipped==='starRacer'?(i%2?'✦':'★'):'•'}</i>)}</div><div className="equipped-chip">{icon} {name}</div></>
}
