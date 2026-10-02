import { useEffect, useRef, useState } from 'react'

const FUN = {
  city: ['⚡ TURBO!', '↗ SHORTCUT!', '🚦 GREEN LIGHT!'],
  forest: ['✨ FIREFLY BOOST!', '🐇 BUNNY HOP!', '🥁 BEAT BOOST!'],
  mountain: ['💎 CRYSTAL BOOST!', '🌊 SPLASH!', '▲ RAMP!'],
  space: ['☄ COMET BOOST!', '★ STAR JUMP!', '🪐 ORBIT BOOST!'],
}

export default function GameJuice() {
  const [playing, setPlaying] = useState(false)
  const [world, setWorld] = useState('city')
  const [pop, setPop] = useState('')
  const [streak, setStreak] = useState(0)
  const streakRef = useRef(0)
  const timer = useRef(null)

  useEffect(() => {
    const sync = () => {
      setPlaying(Boolean(document.querySelector('.play-screen .controller')))
      const hud = document.querySelector('.game-hud')
      if (hud?.classList.contains('forest')) setWorld('forest')
      else if (hud?.classList.contains('mountain')) setWorld('mountain')
      else if (hud?.classList.contains('space')) setWorld('space')
      else setWorld('city')
    }
    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList:true, subtree:true, attributes:true })
    sync()

    const press = (event) => {
      const button = event.target.closest?.('.controller button')
      if (!button || button.disabled || !document.querySelector('.play-screen .game-hud')) return
      window.clearTimeout(timer.current)
      if (button.classList.contains('hint')) {
        streakRef.current += 1
        setStreak(streakRef.current)
        const choices = FUN[world] || FUN.city
        const reward = streakRef.current % 3 === 0 ? choices[(streakRef.current / 3 - 1) % choices.length | 0] : streakRef.current > 1 ? `${streakRef.current}× COMBO!` : '♪ NICE DRIVE!'
        setPop(reward)
        timer.current = window.setTimeout(() => setPop(''), 480)
      } else {
        streakRef.current = 0
        setStreak(0)
        const misses = ['↝ WHOOPS — DETOUR!', '💨 WOBBLE!', '↻ CATCH THE NEXT ONE!']
        setPop(misses[Math.floor(Math.random() * misses.length)])
        timer.current = window.setTimeout(() => setPop(''), 620)
      }
    }
    document.addEventListener('pointerdown', press, true)
    return () => { observer.disconnect(); document.removeEventListener('pointerdown', press, true); window.clearTimeout(timer.current) }
  }, [world])

  if (!playing || !pop) return null
  return <div aria-live="polite" style={{
    position:'fixed',left:'50%',bottom:196,transform:`translateX(-50%) ${streak>=3?'scale(1.08)':''}`,zIndex:47,
    padding:'7px 13px',borderRadius:999,border:'3px solid white',background:streak>=3?'#ffbf32':'rgba(19,67,139,.92)',
    color:streak>=3?'#24477d':'white',fontSize:11,fontWeight:1000,boxShadow:'0 4px 0 rgba(8,37,82,.65)',pointerEvents:'none',whiteSpace:'nowrap'
  }}>{pop}</div>
}
