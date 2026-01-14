import { useState } from 'react'
import { ref, push } from 'firebase/database'
import { database } from '../firebase'

function RsvpForm() {
  const [name, setName] = useState('')
  const [attending, setAttending] = useState(null)
  const [guestCount, setGuestCount] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

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

    try {
      await push(ref(database, 'rsvps'), {
        name: name.trim(),
        attending,
        guestCount: attending ? guestCount : 0,
        timestamp: Date.now()
      })
      setSubmitted(true)
    } catch (err) {
      setError('Oops! Something went wrong. Please try again.')
      console.error(err)
    }
  }

  if (submitted) {
    return (
      <section className="rsvp">
        <h2>Mission Log</h2>
        <div className="success-message">
          <span role="img" aria-label="star">⭐</span>
          <p>Thanks {name}!</p>
          <p>{attending ? "We're excited to see you at the launch!" : "We'll miss you! Thanks for letting us know."}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="rsvp">
      <h2>Mission Log</h2>
      <p className="rsvp-subtitle">Will you be joining our space adventure?</p>

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
          <div className="form-group">
            <label htmlFor="guests">How many astronauts?</label>
            <select
              id="guests"
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="error">{error}</p>}

        <button type="submit" className="submit-btn">
          Submit RSVP 🌟
        </button>
      </form>
    </section>
  )
}

export default RsvpForm
