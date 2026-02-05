import { useState, useEffect, useCallback } from 'react'
import Hero from './components/Hero'
import Commander from './components/Commander'
import PartyDetails from './components/PartyDetails'
import RsvpForm from './components/RsvpForm'
import Guestbook from './components/Guestbook'
import GuestList from './components/GuestList'
import AccessGate from './components/AccessGate'
import AdminPage from './components/AdminPage'

// Mini rocket component for click-to-launch
function MiniRocket({ x, y, onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className="mini-rocket"
      style={{ left: x, top: y }}
    >
      <svg viewBox="0 0 30 50" width="30" height="50">
        <g className="mini-rocket-flame">
          <ellipse cx="15" cy="45" rx="4" ry="8" fill="#ff6b35" opacity="0.9" />
          <ellipse cx="15" cy="43" rx="3" ry="5" fill="#ffd700" />
        </g>
        <path d="M15 5 L22 18 L22 35 L19 38 L11 38 L8 35 L8 18 Z" fill="#fff" />
        <path d="M15 5 L19 14 L11 14 Z" fill="#ff6b9d" />
        <circle cx="15" cy="22" r="4" fill="#74b9ff" />
        <path d="M8 30 L3 40 L8 36 Z" fill="#ff8c42" />
        <path d="M22 30 L27 40 L22 36 Z" fill="#ff8c42" />
      </svg>
    </div>
  )
}

function App() {
  const [showAdmin, setShowAdmin] = useState(false)
  const [rockets, setRockets] = useState([])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    // Check URL for admin
    if (params.get('admin') === 'true') {
      setShowAdmin(true)
    }

    // Check for ICS download request (from email link)
    if (params.get('download') === 'ics') {
      downloadIcsFile()
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const downloadIcsFile = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Hilde Birthday//EN
BEGIN:VEVENT
DTSTART:20260208T150000Z
DTEND:20260208T170000Z
SUMMARY:Hilde's 5th Birthday - Space Mission!
DESCRIPTION:Hudson River Museum Planetarium\\n\\n10:00 AM - Party starts, creative activity\\n10:30 AM - Planetarium show\\n11:00 AM - Refreshments & cake\\n11:45 AM - Party concludes\\n\\nPlease arrive by 10 AM - late entry to the planetarium isn't possible!\\n\\nSee you among the stars!
LOCATION:Hudson River Museum, 511 Warburton Ave, Yonkers, NY 10701
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'hilde-birthday.ics'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleClick = useCallback((e) => {
    // Don't launch rockets when clicking on interactive elements
    if (e.target.closest('button, a, input, textarea, select, form, .modal, .fab-message')) {
      return
    }

    const id = Date.now() + Math.random()
    const newRocket = {
      id,
      x: e.clientX - 15,
      y: e.clientY - 25
    }

    setRockets(prev => [...prev, newRocket])
  }, [])

  const removeRocket = useCallback((id) => {
    setRockets(prev => prev.filter(r => r.id !== id))
  }, [])

  const handleAdminClick = () => {
    setShowAdmin(true)
    window.history.pushState({}, '', '?admin=true')
  }

  const handleBackFromAdmin = () => {
    setShowAdmin(false)
    window.history.pushState({}, '', window.location.pathname)
  }

  if (showAdmin) {
    return <AdminPage onBack={handleBackFromAdmin} />
  }

  return (
    <AccessGate>
      <div className="app" onClick={handleClick}>
        <div className="aurora-bg"></div>
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
        <main>
          <Hero />
          <Commander />
          <PartyDetails />
          <RsvpForm />
          <GuestList />
          <Guestbook />
        </main>
        <footer>
          <p>See you among the stars!</p>
          <button className="admin-link" onClick={handleAdminClick}>
            Mission Control
          </button>
        </footer>

        {/* Click-to-launch rockets */}
        {rockets.map(rocket => (
          <MiniRocket
            key={rocket.id}
            x={rocket.x}
            y={rocket.y}
            onComplete={() => removeRocket(rocket.id)}
          />
        ))}

        {/* RSVP FAB */}
        <button
          className="fab-rsvp"
          onClick={() => document.getElementById('rsvp-section')?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="Go to RSVP"
        >
          <svg viewBox="0 0 24 24" className="fab-icon">
            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <span>RSVP</span>
        </button>
      </div>
    </AccessGate>
  )
}

export default App
