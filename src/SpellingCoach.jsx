import { useEffect, useMemo, useState } from 'react'

const WORDS = [
  'ROAD','CARS','NOTE','PLAY','DRIVER',
  'LAMP','LIFT','GLOW','SONGS','FINISH',
  'HOPS','GLOW','DRUM','OWLS','FOREST',
  'ROCK','FLOW','GEMS','LIGHT','SUMMIT',
  'MOON','STAR','RING','COMET','PLANET',
]

export default function SpellingCoach() {
  const [level, setLevel] = useState(0)
  const [letters, setLetters] = useState(0)
  const [flash, setFlash] = useState(false)
  const word = WORDS[level] || 'GO'

  const slots = useMemo(() => word.split(''), [word])

  useEffect(() => {
    let lastLevel = -1

    const syncLevel = () => {
      const label = document.querySelector('.hud-copy b')?.textContent || ''
      const match = label.match(/LEVEL\s+(\d+)/i)
      if (!match) return
      const nextLevel = Math.max(0, Number(match[1]) - 1)
      if (nextLevel !== lastLevel) {
        lastLevel = nextLevel
        setLevel(nextLevel)
        setLetters(0)
        setFlash(false)
      }
    }

    const onPointer = (event) => {
      const button = event.target.closest?.('.controller button')
      if (!button || button.disabled || !button.classList.contains('hint')) return

      setLetters((current) => {
        const next = Math.min(word.length, current + 1)
        if (next === word.length && current < word.length) {
          setFlash(true)
          window.setTimeout(() => setFlash(false), 1100)
          try {
            if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel()
              const voice = new SpeechSynthesisUtterance(word.toLowerCase())
              voice.rate = 0.82
              voice.pitch = 1.15
              window.speechSynthesis.speak(voice)
            }
          } catch {}
        }
        return next
      })
    }

    const observer = new MutationObserver(syncLevel)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    document.addEventListener('pointerdown', onPointer, true)
    syncLevel()

    return () => {
      observer.disconnect()
      document.removeEventListener('pointerdown', onPointer, true)
    }
  }, [word])

  const playing = Boolean(document.querySelector('.play-screen .controller'))
  if (!playing) return null

  return (
    <div style={{
      position:'fixed', left:'50%', bottom:'124px', transform:'translateX(-50%)', zIndex:45,
      display:'flex', alignItems:'center', gap:5, padding:'6px 10px', border:'3px solid white',
      borderRadius:18, background:'rgba(18,75,145,.88)', boxShadow:'0 4px 0 rgba(8,48,102,.75)',
      pointerEvents:'none', maxWidth:'88vw'
    }} aria-label={`Spell ${word}`}>
      <span style={{fontSize:9,fontWeight:1000,color:'#dff5ff',marginRight:3}}>SPELL</span>
      {slots.map((letter, index) => (
        <span key={index} style={{
          width:25,height:29,borderRadius:8,display:'grid',placeItems:'center',
          background:index < letters ? '#fff27a' : 'rgba(255,255,255,.18)',
          color:index < letters ? '#244d89' : 'rgba(255,255,255,.42)',
          border:'2px solid white',fontSize:17,fontWeight:1000,
          transform:index === letters - 1 ? 'scale(1.12)' : 'scale(1)', transition:'transform .15s ease'
        }}>{index < letters ? letter : '•'}</span>
      ))}
      {flash && <span style={{fontSize:12,fontWeight:1000,color:'#fff',marginLeft:4}}>★ {word}!</span>}
    </div>
  )
}
