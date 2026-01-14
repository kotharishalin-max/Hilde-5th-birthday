import { useState, useEffect } from 'react'
import { ref, push, update, get, query, orderByChild, equalTo } from 'firebase/database'
import { database } from '../firebase'

const STORAGE_KEY = 'hilde-bday-rsvp-email'
const OLD_STORAGE_KEY = 'hilde-bday-rsvp-id'

function RsvpForm() {
  const [mode, setMode] = useState('lookup') // 'lookup', 'form', 'submitted'
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [attending, setAttending] = useState(null)
  const [adultCount, setAdultCount] = useState(1)
  const [kidCount, setKidCount] = useState(0)
  const [existingRsvpId, setExistingRsvpId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [lookingUp, setLookingUp] = useState(false)

  useEffect(() => {
    const init = async () => {
      localStorage.removeItem(OLD_STORAGE_KEY)

      const savedEmail = localStorage.getItem(STORAGE_KEY)
      if (savedEmail) {
        setEmail(savedEmail)
        const found = await lookupByEmail(savedEmail)
        if (found) {
          setMode('submitted')
        } else {
          setMode('lookup')
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const lookupByEmail = async (emailToLookup) => {
    if (!emailToLookup.trim()) return null

    try {
      const rsvpsRef = ref(database, 'rsvps')
      const emailQuery = query(rsvpsRef, orderByChild('email'), equalTo(emailToLookup.toLowerCase().trim()))
      const snapshot = await get(emailQuery)

      if (snapshot.exists()) {
        const data = snapshot.val()
        const [id, rsvp] = Object.entries(data)[0]
        setName(rsvp.name || '')
        setAttending(rsvp.attending)
        setAdultCount(rsvp.adultCount || rsvp.guestCount || 1)
        setKidCount(rsvp.kidCount || 0)
        setExistingRsvpId(id)
        return rsvp
      }
    } catch (err) {
      console.log('Email lookup error:', err.message)
    }
    return null
  }

  const handleLookup = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email')
      return
    }

    setLookingUp(true)
    const found = await lookupByEmail(email)
    setLookingUp(false)

    if (found) {
      localStorage.setItem(STORAGE_KEY, email.toLowerCase().trim())
      setMode('submitted')
    } else {
      setMode('form')
    }
  }

  const handleNewRsvp = () => {
    setMode('form')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email')
      return
    }
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    if (attending === null) {
      setError('Please let us know if you can make it')
      return
    }

    const rsvpData = {
      email: email.toLowerCase().trim(),
      name: name.trim(),
      attending,
      adultCount: attending ? adultCount : 0,
      kidCount: attending ? kidCount : 0,
      timestamp: Date.now()
    }

    try {
      if (existingRsvpId) {
        await update(ref(database, `rsvps/${existingRsvpId}`), rsvpData)
      } else {
        const newRef = await push(ref(database, 'rsvps'), rsvpData)
        setExistingRsvpId(newRef.key)
      }

      localStorage.setItem(STORAGE_KEY, email.toLowerCase().trim())
      setMode('submitted')
    } catch (err) {
      setError('Oops! Something went wrong. Please try again.')
      console.error(err)
    }
  }

  const handleEdit = () => {
    setMode('form')
  }

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setEmail('')
    setName('')
    setAttending(null)
    setAdultCount(1)
    setKidCount(0)
    setExistingRsvpId(null)
    setMode('lookup')
  }

  if (loading) {
    return (
      <section className="rsvp">
        <h2>Mission Log</h2>
        <p className="rsvp-subtitle">Loading...</p>
      </section>
    )
  }

  // LOOKUP MODE - First screen for returning visitors
  if (mode === 'lookup') {
    return (
      <section className="rsvp">
        <h2>Mission Log</h2>
        <p className="rsvp-subtitle">Already RSVP'd? Find your response to update it.</p>

        <form onSubmit={handleLookup} className="lookup-form">
          <div className="form-group">
            <label htmlFor="lookup-email">Your Email</label>
            <input
              type="email"
              id="lookup-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="astronaut@email.com"
              autoFocus
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="submit-btn" disabled={lookingUp}>
            {lookingUp ? 'Searching...' : 'Find My RSVP 🔍'}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button onClick={handleNewRsvp} className="secondary-btn">
          New here? Submit your RSVP
        </button>
      </section>
    )
  }

  // SUBMITTED MODE - Show confirmation with edit option
  if (mode === 'submitted') {
    return (
      <section className="rsvp">
        <h2>Mission Log</h2>
        <div className="success-message">
          <span role="img" aria-label="star">⭐</span>
          <p>Thanks {name}!</p>
          <p>{attending ? "We're excited to see you at the launch!" : "We'll miss you! Thanks for letting us know."}</p>
          {attending && (
            <p className="guest-summary">
              {adultCount} {adultCount === 1 ? 'adult' : 'adults'}
              {kidCount > 0 && `, ${kidCount} ${kidCount === 1 ? 'kid' : 'kids'}`}
            </p>
          )}
          <button onClick={handleEdit} className="edit-btn">
            Edit RSVP
          </button>
          <button onClick={handleReset} className="reset-link">
            Not you? Start fresh
          </button>
        </div>
      </section>
    )
  }

  // FORM MODE - New or editing RSVP
  return (
    <section className="rsvp">
      <h2>Mission Log</h2>
      <p className="rsvp-subtitle">
        {existingRsvpId ? 'Update your RSVP' : 'Will you be joining our space adventure?'}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Your Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="astronaut@email.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="name">Your Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Astronaut name..."
          />
        </div>

        <div className="form-group">
          <label>Can you make it?</label>
          <div className="toggle-buttons">
            <button
              type="button"
              className={`toggle-btn ${attending === true ? 'active yes' : ''}`}
              onClick={() => setAttending(true)}
            >
              🚀 Yes, count me in!
            </button>
            <button
              type="button"
              className={`toggle-btn ${attending === false ? 'active no' : ''}`}
              onClick={() => setAttending(false)}
            >
              😢 Can't make it
            </button>
          </div>
        </div>

        {attending && (
          <>
            <div className="form-group">
              <label htmlFor="adults">Adults</label>
              <select
                id="adults"
                value={adultCount}
                onChange={(e) => setAdultCount(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="kids">Kids</label>
              <select
                id="kids"
                value={kidCount}
                onChange={(e) => setKidCount(Number(e.target.value))}
              >
                {[0, 1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {error && <p className="error">{error}</p>}

        <button type="submit" className="submit-btn">
          {existingRsvpId ? 'Update RSVP 🌟' : 'Submit RSVP 🌟'}
        </button>

        {!existingRsvpId && (
          <button type="button" onClick={handleReset} className="reset-link">
            ← Back to lookup
          </button>
        )}
      </form>
    </section>
  )
}

export default RsvpForm
