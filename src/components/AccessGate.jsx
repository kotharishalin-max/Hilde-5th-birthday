import { useState, useEffect } from 'react'

const GUEST_CODE = 'SPACE2026'
const STORAGE_KEY = 'hilde-bday-access'

function AccessGate({ children }) {
  const [hasAccess, setHasAccess] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'granted') {
      setHasAccess(true)
    }
    setChecking(false)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (code.toUpperCase() === GUEST_CODE) {
      localStorage.setItem(STORAGE_KEY, 'granted')
      setHasAccess(true)
    } else {
      setError('Invalid code. Please check your invitation.')
    }
  }

  if (checking) {
    return (
      <div className="access-gate">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="access-box">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (hasAccess) {
    return children
  }

  return (
    <div className="access-gate">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>
      <div className="access-box">
        <div className="lock-icon">🔐</div>
        <h1>Mission Access Required</h1>
        <p>Enter the code from your invitation to continue</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter access code..."
            autoFocus
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Launch 🚀</button>
        </form>
      </div>
    </div>
  )
}

export default AccessGate
