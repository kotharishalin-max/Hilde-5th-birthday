import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'

// Hide loading screen after app renders
const hideLoadingScreen = () => {
  const loadingScreen = document.getElementById('loading-screen')
  if (loadingScreen) {
    // Small delay to ensure smooth transition
    setTimeout(() => {
      loadingScreen.classList.add('hidden')
      // Remove from DOM after animation
      setTimeout(() => {
        loadingScreen.remove()
      }, 500)
    }, 300)
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Hide loading screen once everything is ready
window.addEventListener('load', hideLoadingScreen)

// Fallback in case load event already fired
if (document.readyState === 'complete') {
  hideLoadingScreen()
}
