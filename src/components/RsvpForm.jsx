import { useState, useEffect } from 'react'
import { ref, push, update, get, query, orderByChild, equalTo } from 'firebase/database'
import { database } from '../firebase'

const STORAGE_KEY = 'hilde-bday-rsvp-email'
const OLD_STORAGE_KEY = 'hilde-bday-rsvp-id' // Legacy key to clean up

function RsvpForm() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [attending, setAttending] = useState(null)
  const [adultCount, setAdultCount] = useState(1)
  const [kidCount, setKidCount] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [existingRsvpId, setExistingRsvpId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [lookingUp, setLookingUp] = useState(false)

  useEffect(() => {
    const loadExistingRsvp = async () => {
      // Clean up old localStorage key
      localStorage.removeItem(OLD_STORAGE_KEY)

      const savedEmail = localStorage.getItem(STORAGE_KEY)
      if (savedEmail) {
        setEmail(savedEmail)
        await lookupByEmail(savedEmail)
      }
      setLoading(false)
    }
    loadExistingRsvp()
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
        setSubmitted(true)
        return rsvp
      }
    } catch (err) {
      // Index not configured - silently fail, user will create new entry
      console.log('Email lookup unavailable (index not configured)')
    }
    return null
  }

  const handleEmailBlur = async () => {
    if (email.trim() && !existingRsvpId) {
      setLookingUp(true)
      await lookupByEmail(email)
      setLookingUp(false)
    }
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
      let rsvpId = existingRsvpId

      // Try to find existing RSVP by email (may fail if index not set up)
      if (!rsvpId) {
        try {
          const rsvpsRef = ref(database, 'rsvps')
          const emailQuery = query(rsvpsRef, orderByChild('email'), equalTo(email.toLowerCase().trim()))
          const snapshot = await get(emailQuery)

          if (snapshot.exists()) {
            rsvpId = Object.keys(snapshot.val())[0]
          }
        } catch (queryErr) {
          // Index not set up - that's ok, we'll create a new entry
          console.log('Email lookup skipped (index not configured)')
        }
      }

      if (rsvpId) {
        await update(ref(database, `rsvps/${rsvpId}`), rsvpData)
        setExistingRsvpId(rsvpId)
      } else {
        const newRef = await push(ref(database, 'rsvps'), rsvpData)
        setExistingRsvpId(newRef.key)
      }

      localStorage.setItem(STORAGE_KEY, email.toLowerCase().trim())
      setSubmitted(true)
      setIsEditing(false)
    } catch (err) {
      setError('Oops! Something went wrong. Please try again.')
      console.error(err)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setSubmitted(false)
  }

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setEmail('')
    setName('')
    setAttending(null)
    setAdultCount(1)
    setKidCount(0)
    setExistingRsvpId(null)
    setSubmitted(false)
    setIsEditing(false)
  }

  if (loading) {
    return (
      <section className="rsvp">
        <h2>Mission Log</h2>
        <p className="rsvp-subtitle">Loading...</p>
      </section>
    )
  }

  if (submitted && !isEditing) {
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
            onBlur={handleEmailBlur}
            placeholder="astronaut@email.com"
          />
          {lookingUp && <p className="lookup-status">Checking for existing RSVP...</p>}
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
      </form>
    </section>
  )
}

export default RsvpForm
