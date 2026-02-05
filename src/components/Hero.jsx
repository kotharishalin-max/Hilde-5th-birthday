import { useState, useEffect } from 'react'

function Hero() {
  const [easterEggClicks, setEasterEggClicks] = useState(0)
  const [showEasterEgg, setShowEasterEgg] = useState(false)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning, astronaut!')
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good afternoon, space explorer!')
    } else if (hour >= 17 && hour < 21) {
      setGreeting('Good evening, star gazer!')
    } else {
      setGreeting('Up late, night owl?')
    }
  }, [])

  const handleAgeBadgeClick = () => {
    const newCount = easterEggClicks + 1
    setEasterEggClicks(newCount)

    if (newCount >= 3) {
      setShowEasterEgg(true)
      setEasterEggClicks(0)
      // Hide after 4 seconds
      setTimeout(() => setShowEasterEgg(false), 4000)
    }
  }

  return (
    <section className="hero">
      {/* Floating planets */}
      <div className="planet planet-1">
        <svg viewBox="0 0 100 100" className="planet-svg">
          <defs>
            <linearGradient id="planet1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b9d" />
              <stop offset="100%" stopColor="#c44569" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#planet1)" />
          <ellipse cx="50" cy="50" rx="60" ry="12" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
        </svg>
      </div>

      <div className="planet planet-2">
        <svg viewBox="0 0 80 80" className="planet-svg">
          <defs>
            <linearGradient id="planet2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="100%" stopColor="#ff8c42" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r="35" fill="url(#planet2)" />
        </svg>
      </div>

      <div className="planet planet-3">
        <svg viewBox="0 0 60 60" className="planet-svg">
          <defs>
            <linearGradient id="planet3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#74b9ff" />
              <stop offset="100%" stopColor="#0984e3" />
            </linearGradient>
          </defs>
          <circle cx="30" cy="30" r="25" fill="url(#planet3)" />
        </svg>
      </div>

      {/* Animated rocket */}
      <div className="rocket-container">
        <svg viewBox="0 0 100 200" className="rocket-svg">
          {/* Flame */}
          <g className="rocket-flame">
            <ellipse cx="50" cy="180" rx="12" ry="25" fill="#ff6b35" opacity="0.9" />
            <ellipse cx="50" cy="175" rx="8" ry="18" fill="#ffd700" />
            <ellipse cx="50" cy="170" rx="4" ry="10" fill="#fff" />
          </g>
          {/* Rocket body */}
          <path d="M50 10 L70 60 L70 130 L60 140 L40 140 L30 130 L30 60 Z" fill="url(#rocketBody)" />
          <defs>
            <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e0e0e0" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#c0c0c0" />
            </linearGradient>
          </defs>
          {/* Rocket tip */}
          <path d="M50 10 L65 45 L35 45 Z" fill="#ff6b9d" />
          {/* Window */}
          <circle cx="50" cy="70" r="12" fill="#74b9ff" stroke="#2d3436" strokeWidth="3" />
          <circle cx="47" cy="67" r="4" fill="rgba(255,255,255,0.6)" />
          {/* Fins */}
          <path d="M30 110 L15 145 L30 135 Z" fill="#ff8c42" />
          <path d="M70 110 L85 145 L70 135 Z" fill="#ff8c42" />
          {/* Stripe */}
          <rect x="35" y="95" width="30" height="8" fill="#ff6b9d" />
        </svg>
      </div>

      {/* Main content */}
      <div className="hero-content">
        {greeting && <p className="hero-greeting">{greeting}</p>}
        <p className="hero-invite">You're invited to</p>
        <h1>Hilde's Space Mission</h1>
        <div className="age-badge-container">
          <div className="age-badge" onClick={handleAgeBadgeClick}>
            <span className="age-number">5</span>
            <span className="age-text">years around the sun!</span>
          </div>
          <span className="age-badge-hint">✨ tap me!</span>
        </div>
      </div>

      {/* Easter Egg - Neptune themed */}
      {showEasterEgg && (
        <div className="easter-egg-overlay">
          <div className="easter-egg-content">
            <div className="neptune-graphic">
              <svg viewBox="0 0 120 120" width="120" height="120">
                <defs>
                  <linearGradient id="neptuneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#74b9ff" />
                    <stop offset="50%" stopColor="#0984e3" />
                    <stop offset="100%" stopColor="#0652DD" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <circle cx="60" cy="60" r="50" fill="url(#neptuneGrad)" filter="url(#glow)" />
                <ellipse cx="60" cy="60" rx="55" ry="8" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" transform="rotate(-15 60 60)" />
                <circle cx="45" cy="45" r="8" fill="rgba(255,255,255,0.2)" />
              </svg>
            </div>
            <p className="easter-egg-title">You discovered Neptune!</p>
            <p className="easter-egg-message">Hilde's favorite planet because it's light blue - her favorite color!</p>
            <span className="easter-egg-emoji">💙🚀</span>
          </div>
        </div>
      )}

      {/* Floating astronaut */}
      <div className="astronaut-float">
        <svg viewBox="0 0 100 140" className="astronaut-svg">
          {/* Backpack */}
          <rect x="30" y="45" width="40" height="50" rx="5" fill="#636e72" />
          {/* Body */}
          <ellipse cx="50" cy="80" rx="25" ry="30" fill="white" />
          {/* Helmet */}
          <circle cx="50" cy="35" r="28" fill="white" />
          {/* Visor */}
          <ellipse cx="50" cy="38" rx="20" ry="18" fill="#74b9ff" opacity="0.8" />
          <ellipse cx="45" cy="33" rx="6" ry="4" fill="rgba(255,255,255,0.5)" />
          {/* Arms */}
          <ellipse cx="20" cy="75" rx="10" ry="15" fill="white" />
          <ellipse cx="80" cy="75" rx="10" ry="15" fill="white" />
          {/* Legs */}
          <ellipse cx="38" cy="115" rx="10" ry="18" fill="white" />
          <ellipse cx="62" cy="115" rx="10" ry="18" fill="white" />
          {/* Helmet ring */}
          <ellipse cx="50" cy="55" rx="25" ry="5" fill="#dfe6e9" />
        </svg>
      </div>
    </section>
  )
}

export default Hero
