import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { database } from '../firebase'

const ADMIN_CODE = 'HILDE-ADMIN-2026'
const STORAGE_KEY = 'hilde-bday-admin'

function AdminPage({ onBack }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [rsvps, setRsvps] = useState([])
  const [totals, setTotals] = useState({ attending: 0, notAttending: 0, adults: 0, kids: 0 })

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'granted') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return

    const rsvpsRef = ref(database, 'rsvps')
    const unsubscribe = onValue(rsvpsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const rsvpList = Object.entries(data)
          .map(([id, rsvp]) => ({ id, ...rsvp }))
          .sort((a, b) => b.timestamp - a.timestamp)

        setRsvps(rsvpList)

        const attending = rsvpList.filter(r => r.attending)
        const notAttending = rsvpList.filter(r => !r.attending)
        const totalAdults = attending.reduce((sum, r) => sum + (r.adultCount || r.guestCount || 1), 0)
        const totalKids = attending.reduce((sum, r) => sum + (r.kidCount || 0), 0)

        setTotals({
          attending: attending.length,
          notAttending: notAttending.length,
          adults: totalAdults,
          kids: totalKids
        })
      }
    })

    return () => unsubscribe()
  }, [isAuthenticated])

  const handleLogin = (e) => {
    e.preventDefault()
    if (code.toUpperCase() === ADMIN_CODE) {
      localStorage.setItem(STORAGE_KEY, 'granted')
      setIsAuthenticated(true)
    } else {
      setError('Invalid admin code')
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <div className="admin-login">
          <h1>Mission Control</h1>
          <p>Enter admin code to access</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Admin code..."
              autoFocus
            />
            {error && <p className="error">{error}</p>}
            <button type="submit">Access</button>
          </form>
          <button className="back-link" onClick={onBack}>← Back to site</button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Mission Control</h1>
        <button className="back-link" onClick={onBack}>← Back to site</button>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <span className="stat-number">{totals.attending}</span>
          <span className="stat-label">Attending</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{totals.notAttending}</span>
          <span className="stat-label">Can't Make It</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{totals.adults}</span>
          <span className="stat-label">Adults</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{totals.kids}</span>
          <span className="stat-label">Kids</span>
        </div>
        <div className="stat-card highlight">
          <span className="stat-number">{totals.adults + totals.kids}</span>
          <span className="stat-label">Total Guests</span>
        </div>
      </div>

      <div className="admin-table-container">
        <h2>All RSVPs</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Response</th>
              <th>Adults</th>
              <th>Kids</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {rsvps.map((rsvp) => (
              <tr key={rsvp.id} className={rsvp.attending ? 'attending' : 'not-attending'}>
                <td>{rsvp.name}</td>
                <td>{rsvp.email || '-'}</td>
                <td>{rsvp.attending ? '✅ Yes' : '❌ No'}</td>
                <td>{rsvp.attending ? (rsvp.adultCount || rsvp.guestCount || 1) : '-'}</td>
                <td>{rsvp.attending ? (rsvp.kidCount || 0) : '-'}</td>
                <td>{formatDate(rsvp.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminPage
