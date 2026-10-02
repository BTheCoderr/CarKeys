import { useEffect, useMemo, useRef, useState } from 'react'

const NOTES = ['C','D','E','F']
const FREQ = [261.63,293.66,329.63,349.23]
const LISTEN_START_LEVEL = 15
const LEVEL_PATTERNS = [
  [0,0,0,0],[0,1,0,1],[0,1,2,1],[0,1,2,3],[0,2,1,3,0,1],
  [0,0,1,1],[0,1,0,1],[0,1,2,3],[0,2,1,3,2],[0,1,2,3,1,3],
  [0,0,1,1],[0,1,2,1],[2,2,0,2],[0,2,1,3],[0,1,2,3,2,1],
  [0,0,1,2],[0,1,2,3],[1,2,1,3],[0,2,3,2,1],[0,1,2,3,0,3],
  [0,0,1,2],[0,1,2,3],[1,2,3,1],[0,2,1,3,2],[0,1,2,3,0,2],
]

function tone(index, duration = 280) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = tone.ctx || (tone.ctx = new AudioCtx())
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = FREQ[index]
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.17, ctx.currentTime + 0.025)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration / 1000)
    osc.connect(gain); gain.connect(ctx.destination)
    osc.start(); osc.stop(ctx.currentTime + duration / 1000 + 0.03)
  } catch {}
}

export default function ListenDrive() {
  const [playing, setPlaying] = useState(false)
  const [level, setLevel] = useState(0)
  const [phase, setPhase] = useState('idle')
  const [heard, setHeard] = useState(-1)
  const [attempt, setAttempt] = useState(0)
  const [message, setMessage] = useState('')
  const lastLevel = useRef(-1)
  const timers = useRef([])
  const pattern = useMemo(() => (LEVEL_PATTERNS[level] || [0,1,2,3]).slice(0, level >= 20 ? 4 : 3), [level])

  const clearTimers = () => {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
  }

  const playPhrase = () => {
    clearTimers()
    setPhase('listen')
    setAttempt(0)
    setMessage('LISTEN…')
    setHeard(-1)
    pattern.forEach((note, index) => {
      timers.current.push(window.setTimeout(() => {
        setHeard(index)
        tone(note)
      }, 300 + index * 520))
    })
    timers.current.push(window.setTimeout(() => {
      setHeard(-1)
      setPhase('drive')
      setMessage('YOUR TURN')
      window.setTimeout(() => setMessage(''), 700)
    }, 450 + pattern.length * 520))
  }

  useEffect(() => {
    const sync = () => {
      const isPlaying = Boolean(document.querySelector('.play-screen .controller'))
      setPlaying(isPlaying)
      const label = document.querySelector('.hud-copy b')?.textContent || ''
      const match = label.match(/LEVEL\s+(\d+)/i)
      if (!match) return
      const next = Math.max(0, Number(match[1]) - 1)
      if (next !== lastLevel.current) {
        lastLevel.current = next
        setLevel(next)
        setPhase('idle')
        setAttempt(0)
        setMessage('')
      }
    }
    const observer = new MutationObserver(sync)
    observer.observe(document.body,{childList:true,subtree:true,characterData:true})
    sync()
    return () => { observer.disconnect(); clearTimers() }
  }, [])

  useEffect(() => {
    if (!playing || level < LISTEN_START_LEVEL || phase !== 'idle') return
    const id = window.setTimeout(playPhrase, 700)
    return () => window.clearTimeout(id)
  }, [playing, level, phase, pattern])

  useEffect(() => {
    const onPress = (event) => {
      if (!playing || level < LISTEN_START_LEVEL || phase !== 'drive') return
      const button = event.target.closest?.('.controller button')
      if (!button || button.disabled) return
      const text = button.textContent || ''
      const pressed = NOTES.findIndex((note) => text.includes(note))
      if (pressed < 0) return
      const expected = pattern[attempt]
      if (pressed === expected) {
        const next = attempt + 1
        tone(pressed, 190)
        setAttempt(next)
        if (next >= pattern.length) {
          setMessage('MEMORY MASTER! ★')
          setPhase('done')
          try { navigator.vibrate?.([10,20,10]) } catch {}
        } else {
          setMessage('NICE!')
          window.setTimeout(() => setMessage(''), 320)
        }
      } else {
        setMessage('LISTEN AGAIN')
        setAttempt(0)
        setPhase('retry')
        try { navigator.vibrate?.(10) } catch {}
        timers.current.push(window.setTimeout(playPhrase, 650))
      }
    }
    document.addEventListener('pointerdown', onPress, true)
    return () => document.removeEventListener('pointerdown', onPress, true)
  }, [playing, level, phase, attempt, pattern])

  if (!playing || level < LISTEN_START_LEVEL) return null

  return (
    <div style={{position:'fixed',right:10,top:118,zIndex:46,display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'6px 9px',border:'3px solid white',borderRadius:16,background:'rgba(91,55,174,.92)',boxShadow:'0 4px 0 #3b237d',color:'#fff',pointerEvents:'none'}}>
      <div style={{fontSize:9,fontWeight:1000,letterSpacing:'.06em'}}>👂 LISTEN & DRIVE</div>
      <div style={{display:'flex',gap:4}}>
        {pattern.map((note,index) => (
          <span key={index} style={{width:22,height:22,borderRadius:'50%',display:'grid',placeItems:'center',border:'2px solid white',background:phase === 'listen' && heard === index ? '#ffe05a' : index < attempt ? '#63dc82' : 'rgba(255,255,255,.16)',color:phase === 'listen' && heard === index ? '#47347c' : '#fff',fontSize:phase === 'drive' || phase === 'done' ? 10 : 0,fontWeight:1000}}>{phase === 'done' ? note : index < attempt ? '✓' : '♪'}</span>
        ))}
      </div>
      <div style={{minHeight:12,fontSize:9,fontWeight:1000,color:'#fff4a8'}}>{message || (phase === 'drive' ? 'PLAY IT BACK' : '')}</div>
    </div>
  )
}
