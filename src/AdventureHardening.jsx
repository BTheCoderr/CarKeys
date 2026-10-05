import { useEffect } from 'react'

const BEST='carkeys-best-level-v1'
const LEVEL='carkeys-level'
const COMPLETE='carkeys-space-complete'
const MAX=24
const n=v=>{const x=Number(v);return Number.isFinite(x)?Math.max(0,Math.min(MAX,x)):0}

export default function AdventureHardening(){
 useEffect(()=>{
   const remember=()=>{
     const current=n(localStorage.getItem(LEVEL))
     const previous=n(localStorage.getItem(BEST))
     const best=Math.max(previous,current)
     localStorage.setItem(BEST,String(best))
     // Replaying an earlier world must never become the player's new Continue point.
     if(localStorage.getItem(COMPLETE)!=='1'&&current<best){
       localStorage.setItem(LEVEL,String(best))
     }
   }
   remember()
   const timer=setInterval(remember,900)
   const visible=()=>{if(document.visibilityState==='visible')remember()}
   document.addEventListener('visibilitychange',visible)
   return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',visible)}
 },[])
 return null
}
