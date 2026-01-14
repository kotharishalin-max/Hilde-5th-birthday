import { useState, useEffect } from 'react'
import { ref, push, onValue } from 'firebase/database'
import { database } from '../firebase'

function Guestbook() {
  const [messages, setMessages] = useState([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const messagesRef = ref(database, 'messages')
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const messageList = Object.entries(data)
          .map(([id, msg]) => ({ id, ...msg }))
          .sort((a, b) => b.timestamp - a.timestamp)
        setMessages(messageList)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return

    setSubmitting(true)
    try {
      await push(ref(database, 'messages'), {
        name: name.trim(),
        message: message.trim(),
        timestamp: Date.now()
      })
      setName('')
      setMessage('')
    } catch (err) {
      console.error(err)
    }
    setSubmitting(false)
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <section className="guestbook">
      <h2>Transmissions from Space</h2>
      <p className="guestbook-subtitle">Send a message to Hilde!</p>

      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your message for Hilde..."
          rows={3}
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send Message 📡'}
        </button>
      </form>

      <div className="messages-list">
        {messages.length === 0 ? (
          <p className="no-messages">No transmissions yet. Be the first!</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="message-card">
              <div className="message-header">
                <span className="message-author">{msg.name}</span>
                <span className="message-date">{formatDate(msg.timestamp)}</span>
              </div>
              <p className="message-text">{msg.message}</p>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export default Guestbook
