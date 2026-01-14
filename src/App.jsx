import { useState, useEffect } from 'react'
import Hero from './components/Hero'
import PartyDetails from './components/PartyDetails'
import RsvpForm from './components/RsvpForm'
import Guestbook from './components/Guestbook'
import GuestList from './components/GuestList'
import AccessGate from './components/AccessGate'
import AdminPage from './components/AdminPage'

const RSVP_STORAGE_KEY = 'hilde-bday-rsvp-id'

function App() {
  const [showAdmin, setShowAdmin] = useState(false)
  const [hasRsvpd, setHasRsvpd] = useState(false)

  useEffect(() => {
    // Check if user has RSVP'd
    const rsvpId = localStorage.getItem(RSVP_STORAGE_KEY)
    setHasRsvpd(!!rsvpId)

    // Check URL for admin
    const params = new URLSearchParams(window.location.search)
    if (params.get('admin') === 'true') {
      setShowAdmin(true)
    }

    // Listen for RSVP changes
    const handleStorage = () => {
      const rsvpId = localStorage.getItem(RSVP_STORAGE_KEY)
      setHasRsvpd(!!rsvpId)
    }
    window.addEventListener('storage', handleStorage)

    // Also check periodically for same-tab updates
    const interval = setInterval(() => {
      const rsvpId = localStorage.getItem(RSVP_STORAGE_KEY)
      setHasRsvpd(!!rsvpId)
    }, 1000)

    return () => {
      window.removeEventListener('storage', handleStorage)
      clearInterval(interval)
    }
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
      <div className="app">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
        <main>
          <Hero />
          <PartyDetails />
          <RsvpForm />
          {hasRsvpd && <GuestList />}
          <Guestbook />
        </main>
        <footer>
          <p>See you among the stars!</p>
          <button className="admin-link" onClick={handleAdminClick}>
            Mission Control
          </button>
        </footer>
      </div>
    </AccessGate>
  )
}

export default App
