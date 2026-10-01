import { useEffect, useMemo, useRef, useState } from 'react'

const WORDS = [
  'ROAD','CARS','NOTE','PLAY','DRIVER',
  'LAMP','LIFT','GLOW','SONGS','FINISH',
  'HOPS','GLOW','DRUM','OWLS','FOREST',
  'ROCK','FLOW','GEMS','LIGHT','SUMMIT',
  'MOON','STAR','RING','COMET','PLANET',
]

const FRIENDLY_DISTRACTORS = ['A','E','I','O','U','R','S','T','M','N','L','P','D','G','F','B']

function say(text) {
  try {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const voice = new SpeechSynthesisUtterance(text.toLowerCase())
    voice.rate = 0.82
    voice.pitch = 1.12
    window.speechSynthesis.speak(voice)
  } catch {}
}

function choicesFor(word, missingIndex) {
  const answer = word[missingIndex]
  const pool = FRIENDLY_DISTRACTORS.filter((letter) => letter !== answer && !word.includes(letter))
  const first = pool[(missingIndex + word.length) % pool.length] || 'A'
  const second = pool[(missingIndex * 3 + word.charCodeAt(0)) % pool.length] || 'E'
  return [answer, first, second].sort((a, b) => ((a.charCodeAt(0) + missingIndex) % 5) - ((b.charCodeAt(0) + missingIndex) % 5))
}

export default function SpellingCoach() {
  const [level, setLevel] = useState(0)
  const [letters, setLetters] = useState(0)
  const [flash, setFlash] = useState(false)
  const [wrongLetter, setWrongLetter] = useState('')
  const [playing, setPlaying] = useState(false)
  const lastLevelRef = useRef(-1)
  const word = WORDS[level] || 'GO'
  const missingMode = level >= 5
  const missingIndex = useMemo(() => Math.min(word.length - 1, 1 + (level % Math.max(1, word.length - 1))), [level, word])
  const choices = useMemo(() => choicesFor(word, missingIndex), [word, missingIndex])

  useEffect(() => {
    const sync = () => {
      setPlaying(Boolean(document.querySelector('.play-screen .controller')))
      const label = document.querySelector('.hud-copy b')?.textContent || ''
      const match = label.match(/LEVEL\s+(\d+)/i)
      if (!match) return
      const nextLevel = Math.max(0, Number(match[1]) - 1)
      if (nextLevel !== lastLevelRef.current) {
        lastLevelRef.current = nextLevel
        setLevel(nextLevel)
        setLetters(0)
        setFlash(false)
        setWrongLetter('')
      }
    }

    const onPointer = (event) => {
      const button = event.target.closest?.('.controller button')
      if (!button || button.disabled || !button.classList.contains('hint')) return
      setLetters((current) => {
        const next = Math.min(word.length, current + 1)
        if (!missingMode && next === word.length && current < word.length) {
          setFlash(true)
          say(word)
          window.setTimeout(() => setFlash(false), 1100)
        }
        return next
      })
    }

    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    document.addEventListener('pointerdown', onPointer, true)
    sync()
    return () => {
      observer.disconnect()
      document.removeEventListener('pointerdown', onPointer, true)
    }
  }, [word, missingMode])

  if (!playing) return null

  const chooseLetter = (letter) => {
    if (letter === word[missingIndex]) {
      setWrongLetter('')
      setLetters(word.length)
      setFlash(true)
      say(word)
      try { navigator.vibrate?.([12, 24, 12]) } catch {}
      window.setTimeout(() => setFlash(false), 1200)
    } else {
      setWrongLetter(letter)
      try { navigator.vibrate?.(10) } catch {}
      window.setTimeout(() => setWrongLetter(''), 500)
    }
  }

  const collected = Math.min(word.length, letters)
  const readyForMissing = missingMode && collected >= Math.max(1, word.length - 1)

  return (
    <div style={{
      position:'fixed', left:'50%', bottom:'124px', transform:'translateX(-50%)', zIndex:45,
      display:'flex', flexDirection:'column', alignItems:'center', gap:5, padding:'6px 10px', border:'3px solid white',
      borderRadius:18, background:'rgba(18,75,145,.91)', boxShadow:'0 4px 0 rgba(8,48,102,.75)',
      maxWidth:'92vw'
    }} aria-label={missingMode ? `Find the missing letter in ${word}` : `Spell ${word}`}>
      <div style={{display:'flex',alignItems:'center',gap:5,pointerEvents:'none'}}>
        <span style={{fontSize:9,fontWeight:1000,color:'#dff5ff',marginRight:3}}>{missingMode ? 'BUILD' : 'SPELL'}</span>
        {word.split('').map((letter, index) => {
          const hidden = missingMode && index === missingIndex
          const revealed = !hidden && (index < collected || readyForMissing)
          return (
            <span key={index} style={{
              width:25,height:29,borderRadius:8,display:'grid',placeItems:'center',
              background:hidden ? '#ffdb58' : revealed ? '#fff27a' : 'rgba(255,255,255,.18)',
              color:hidden ? '#244d89' : revealed ? '#244d89' : 'rgba(255,255,255,.42)',
              border:'2px solid white',fontSize:17,fontWeight:1000,
              transform:index === collected - 1 ? 'scale(1.12)' : 'scale(1)', transition:'transform .15s ease'
            }}>{hidden ? (flash ? letter : '?') : revealed ? letter : '•'}</span>
          )
        })}
        {flash && <span style={{fontSize:12,fontWeight:1000,color:'#fff',marginLeft:4}}>★ {word}!</span>}
      </div>

      {readyForMissing && !flash && (
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <span style={{fontSize:9,fontWeight:1000,color:'#fff'}}>MISSING?</span>
          {choices.map((letter) => (
            <button key={letter} onPointerDown={(event) => { event.stopPropagation(); chooseLetter(letter) }} style={{
              width:34,height:32,border:'2px solid white',borderRadius:10,
              background:wrongLetter === letter ? '#ff6b75' : '#55c7ff',color:'#fff',
              fontSize:17,fontWeight:1000,boxShadow:'0 3px 0 #176ba2',touchAction:'manipulation'
            }}>{letter}</button>
          ))}
        </div>
      )}
    </div>
  )
}
