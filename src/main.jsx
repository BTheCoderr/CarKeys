import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import LearningHUD from './LearningHUD.jsx'
import GameJuice from './GameJuice.jsx'
import './styles.css'
import './road-events.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <LearningHUD />
    <GameJuice />
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
