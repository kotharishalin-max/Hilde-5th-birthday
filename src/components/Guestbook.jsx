import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ref, push, onValue } from 'firebase/database'
import { database } from '../firebase'

function Guestbook() {
  const [messages, setMessages] = useState([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showAllMessages, setShowAllMessages] = useState(false)
  const [justSent, setJustSent] = useState(false)

  useEffect(() => {
    const messagesRef = ref(database, 'messages')
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const messageList = Object.entries(data)
          .map(([id, msg]) => ({ id, ...msg }))
          .sort((a, b) => b.timestamp - a.timestamp)
        setMessages(messageList)
      } else {
        setMessages([])
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
      setJustSent(true)
      setTimeout(() => {
        setShowModal(false)
        setJustSent(false)
      }, 1500)
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

  const displayedMessages = showAllMessages ? messages : messages.slice(0, 3)

  // Render Modal via portal to escape stacking context
  const modal = showModal && (
    <div className="message-modal-overlay" onClick={() => setShowModal(false)}>
      <div className="message-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setShowModal(false)}>×</button>

        {justSent ? (
          <div className="message-sent-success">
            <span className="success-rocket">🚀</span>
            <p>Message sent to space!</p>
          </div>
        ) : (
          <>
            <h3>Send a Transmission</h3>
            <p className="modal-subtitle">Leave a birthday wish for Hilde!</p>

            <form onSubmit={handleSubmit} className="modal-form">
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
                placeholder="Your message..."
                rows={4}
                required
              />
              <button type="submit" disabled={submitting} className="modal-submit">
                {submitting ? 'Transmitting...' : 'Send Message'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Portal Modal to body to escape stacking context */}
      {createPortal(modal, document.body)}

      {/* Messages Section */}
      <section className="guestbook">
        <div className="guestbook-header">
          <div>
            <h2>Transmissions from Space</h2>
            <p className="guestbook-subtitle">
              {messages.length === 0
                ? 'No messages yet - be the first!'
                : `${messages.length} message${messages.length !== 1 ? 's' : ''} received`
              }
            </p>
          </div>
          <button className="send-message-btn-inline" onClick={() => setShowModal(true)}>
            + Send Message
          </button>
        </div>

        {messages.length > 0 && (
          <>
            <div className="messages-grid">
              {displayedMessages.map((msg, index) => (
                <div
                  key={msg.id}
                  className="message-card"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="message-avatar">
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-author">{msg.name}</span>
                      <span className="message-date">{formatDate(msg.timestamp)}</span>
                    </div>
                    <p className="message-text">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {messages.length > 3 && (
              <button
                className="view-all-btn"
                onClick={() => setShowAllMessages(!showAllMessages)}
              >
                {showAllMessages
                  ? 'Show Less'
                  : `View All ${messages.length} Messages`
                }
              </button>
            )}
          </>
        )}

        {messages.length === 0 && (
          <div className="no-messages-cta">
            <div className="empty-state-icon">📡</div>
            <p>Awaiting transmissions...</p>
            <button className="send-first-btn" onClick={() => setShowModal(true)}>
              Be the First to Send a Message
            </button>
          </div>
        )}
      </section>
    </>
  )
}

export default Guestbook
