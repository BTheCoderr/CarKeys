import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import LearningHUD from './LearningHUD.jsx'
import GameJuice from './GameJuice.jsx'
import MissionDirector from './MissionDirector.jsx'
import './styles.css'
import './road-events.css'
import './missions.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <LearningHUD />
    <GameJuice />
    <MissionDirector />
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
