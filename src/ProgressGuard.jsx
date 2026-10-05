import { useEffect } from 'react'

const LEVEL_KEY='carkeys-level'
const MAX_LEVEL=24
const WORLD_KEYS=[
  ['carkeys-complete','carkeys-pink',9,10],
  ['carkeys-all-complete','carkeys-green',14,15],
  ['carkeys-mountain-complete','carkeys-gold',19,20],
]

function number(value,fallback=0){const n=Number(value);return Number.isFinite(n)?n:fallback}
function repair(){
  let saved=Math.max(0,Math.min(MAX_LEVEL,number(localStorage.getItem(LEVEL_KEY))))
  let minimum=0
  WORLD_KEYS.forEach(([complete,unlock,boss,next])=>{
    const won=localStorage.getItem(complete)==='1'||localStorage.getItem(unlock)==='1'
    if(won){
      localStorage.setItem(complete,'1')
      localStorage.setItem(unlock,'1')
      minimum=Math.max(minimum,next)
    }else if(saved>boss){
      // A save beyond a world boundary proves that boundary was cleared.
      localStorage.setItem(complete,'1')
      localStorage.setItem(unlock,'1')
      minimum=Math.max(minimum,next)
    }
  })
  if(localStorage.getItem('carkeys-space-complete')==='1'){
    localStorage.setItem('carkeys-purple','1')
    saved=MAX_LEVEL
  }else saved=Math.max(saved,minimum)
  localStorage.setItem(LEVEL_KEY,String(Math.min(MAX_LEVEL,saved)))
}

export default function ProgressGuard(){
  useEffect(()=>{
    repair()
    const onStorage=e=>{if(!e.key||e.key.startsWith('carkeys-'))repair()}
    const onVisibility=()=>{if(document.visibilityState==='visible')repair()}
    window.addEventListener('storage',onStorage)
    document.addEventListener('visibilitychange',onVisibility)
    return()=>{window.removeEventListener('storage',onStorage);document.removeEventListener('visibilitychange',onVisibility)}
  },[])
  return null
}
