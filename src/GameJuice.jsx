import { useEffect, useRef, useState } from 'react'

const EVENTS = {
  city: [
    { label:'⚡ TURBO!', kind:'turbo' }, { label:'↗ SHORTCUT!', kind:'shortcut' }, { label:'🚦 GREEN LIGHT!', kind:'gate' },
  ],
  forest: [
    { label:'✨ FIREFLY BOOST!', kind:'turbo' }, { label:'🐇 BUNNY HOP!', kind:'jump' }, { label:'🥁 BEAT BOOST!', kind:'rival' },
  ],
  mountain: [
    { label:'💎 CRYSTAL BOOST!', kind:'turbo' }, { label:'🌊 SPLASH!', kind:'splash' }, { label:'▲ RAMP!', kind:'jump' },
  ],
  space: [
    { label:'☄ COMET BOOST!', kind:'rival' }, { label:'★ STAR JUMP!', kind:'jump' }, { label:'🪐 ORBIT BOOST!', kind:'turbo' },
  ],
}

export default function GameJuice() {
  const [playing,setPlaying]=useState(false),[world,setWorld]=useState('city'),[pop,setPop]=useState(''),[streak,setStreak]=useState(0),[event,setEvent]=useState(null)
  const streakRef=useRef(0), timer=useRef(null), eventTimer=useRef(null)

  useEffect(()=>{
    const sync=()=>{
      setPlaying(Boolean(document.querySelector('.play-screen .controller')))
      const hud=document.querySelector('.game-hud')
      if(hud?.classList.contains('forest'))setWorld('forest');else if(hud?.classList.contains('mountain'))setWorld('mountain');else if(hud?.classList.contains('space'))setWorld('space');else setWorld('city')
    }
    const observer=new MutationObserver(sync);observer.observe(document.body,{childList:true,subtree:true,attributes:true});sync()
    const press=e=>{
      const b=e.target.closest?.('.controller button');if(!b||b.disabled||!document.querySelector('.play-screen .game-hud'))return
      clearTimeout(timer.current);clearTimeout(eventTimer.current)
      if(b.classList.contains('hint')){
        streakRef.current+=1;setStreak(streakRef.current)
        if(streakRef.current%3===0){
          const choices=EVENTS[world]||EVENTS.city, reward=choices[((streakRef.current/3)-1)%choices.length|0]
          setPop(reward.label);setEvent({...reward,id:Date.now()});eventTimer.current=setTimeout(()=>setEvent(null),1050)
        }else setPop(streakRef.current>1?`${streakRef.current}× COMBO!`:'♪ NICE DRIVE!')
        timer.current=setTimeout(()=>setPop(''),520)
      }else{
        streakRef.current=0;setStreak(0);setEvent({kind:'wobble',id:Date.now()})
        const misses=['↝ WHOOPS — DETOUR!','💨 WOBBLE!','↻ CATCH THE NEXT ONE!'];setPop(misses[Math.floor(Math.random()*misses.length)])
        timer.current=setTimeout(()=>setPop(''),620);eventTimer.current=setTimeout(()=>setEvent(null),520)
      }
    }
    document.addEventListener('pointerdown',press,true)
    return()=>{observer.disconnect();document.removeEventListener('pointerdown',press,true);clearTimeout(timer.current);clearTimeout(eventTimer.current)}
  },[world])

  if(!playing)return null
  return <>
    {event&&<div key={event.id} className={`road-event road-event-${event.kind}`} aria-hidden="true">
      {event.kind==='jump'&&<><i className="ramp"/><span className="air-car">🏎️</span></>}
      {event.kind==='shortcut'&&<><i className="shortcut-road"/><span className="shortcut-arrow">↗</span></>}
      {event.kind==='gate'&&<><i className="gate left"/><i className="gate right"/><span className="gate-light">●</span></>}
      {event.kind==='rival'&&<span className="rival-car">🏎️</span>}
      {event.kind==='turbo'&&<><i className="speed-line a"/><i className="speed-line b"/><i className="speed-line c"/></>}
      {event.kind==='splash'&&<><i className="splash a"/><i className="splash b"/><i className="splash c"/></>}
      {event.kind==='wobble'&&<span className="wobble-mark">〰</span>}
    </div>}
    {pop&&<div aria-live="polite" className={'game-juice-pop '+(streak>=3?'hot':'')}>{pop}</div>}
  </>
}
