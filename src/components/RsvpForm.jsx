import { useState, useEffect } from 'react'
import { ref, push, update, get } from 'firebase/database'
import { database } from '../firebase'

const STORAGE_KEY = 'hilde-bday-rsvp-id'

function RsvpForm() {
  const [name, setName] = useState('')
  const [attending, setAttending] = useState(null)
  const [adultCount, setAdultCount] = useState(1)
  const [kidCount, setKidCount] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [existingRsvpId, setExistingRsvpId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadExistingRsvp = async () => {
      const savedId = localStorage.getItem(STORAGE_KEY)
      if (savedId) {
        try {
          const snapshot = await get(ref(database, `rsvps/${savedId}`))
          if (snapshot.exists()) {
            const data = snapshot.val()
            setName(data.name || '')
            setAttending(data.attending)
            setAdultCount(data.adultCount || data.guestCount || 1)
            setKidCount(data.kidCount || 0)
            setExistingRsvpId(savedId)
            setSubmitted(true)
          }
        } catch (err) {
          console.error('Error loading RSVP:', err)
        }
      }
      setLoading(false)
    }
    loadExistingRsvp()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    if (attending === null) {
      setError('Please let us know if you can make it')
      return
    }

    const rsvpData = {
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
        const newId = newRef.key
        localStorage.setItem(STORAGE_KEY, newId)
        setExistingRsvpId(newId)
      }
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
