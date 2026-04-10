import { useCallback, useEffect, useRef, useState } from 'react'
import { getChatMessagesApi, sendChatMessageApi } from '../api/chatApi'
import {
  joinChatRoom,
  sendChatMessageSocket,
  subscribeChatMessages,
} from '../realtime/socketService'
import { useAuth } from '../../features/auth/useAuth'

/**
 * ChatBox – khung chat dùng chung cho bệnh nhân và nhân viên.
 * Props:
 *   roomId    – patientId (bệnh nhân truyền userId của mình, staff truyền userId bệnh nhân)
 *   title     – tiêu đề hiển thị trên khung chat (tuỳ chọn)
 */
export function ChatBox({ roomId, title = 'Hỗ trợ trực tuyến' }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Tải lịch sử tin nhắn
  const loadMessages = useCallback(async () => {
    if (!roomId) return
    setLoading(true)
    setError('')
    try {
      const isStaffOrAdmin = user?.role === 'staff' || user?.role === 'admin'
      const data = await getChatMessagesApi(isStaffOrAdmin ? roomId : null)
      setMessages(data)
    } catch {
      setError('Không thể tải tin nhắn.')
    } finally {
      setLoading(false)
    }
  }, [roomId, user?.role])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  // Join phòng socket và nhận tin nhắn realtime
  useEffect(() => {
    if (!roomId) return
    joinChatRoom(roomId)
    const unsubscribe = subscribeChatMessages((msg) => {
      if (msg.roomId === roomId) {
        setMessages((prev) => {
          // Tránh duplicate nếu REST và socket cùng trả về
          if (prev.some((m) => m._id === msg._id)) return prev
          return [...prev, msg]
        })
      }
    })
    return unsubscribe
  }, [roomId])

  // Tự cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = async () => {
    const content = input.trim()
    if (!content || !roomId) return

    setInput('')
    setSending(true)
    setError('')
    try {
      // Gửi qua socket (nhanh hơn) – server sẽ lưu DB và broadcast lại
      sendChatMessageSocket({
        roomId,
        content,
        senderId: user?.id || user?._id,
        senderRole: user?.role,
        senderName: user?.name,
      })
    } catch {
      // Fallback REST nếu socket lỗi
      try {
        const isStaffOrAdmin = user?.role === 'staff' || user?.role === 'admin'
        const msg = await sendChatMessageApi({ content, roomId: isStaffOrAdmin ? roomId : null })
        setMessages((prev) => [...prev, msg])
      } catch {
        setError('Gửi tin nhắn thất bại. Vui lòng thử lại.')
      }
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (value) => {
    if (!value) return ''
    return new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  const isMe = (msg) => {
    const senderId = msg.sender?._id || msg.sender
    const myId = user?.id || user?._id
    return String(senderId) === String(myId)
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <strong>{title}</strong>
        <button type="button" onClick={loadMessages} disabled={loading} style={styles.refreshBtn}>
          {loading ? '...' : '↻'}
        </button>
      </div>

      <div style={styles.body}>
        {messages.length === 0 && !loading ? (
          <p style={styles.empty}>Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!</p>
        ) : null}

        {messages.map((msg) => {
          const mine = isMe(msg)
          const senderName = msg.sender?.name || (mine ? 'Bạn' : 'Nhân viên')
          return (
            <div key={msg._id} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', marginBottom: '0.5rem' }}>
              <span style={styles.senderLabel}>{mine ? 'Bạn' : senderName}</span>
              <div style={{ ...styles.bubble, ...(mine ? styles.bubbleMine : styles.bubbleOther) }}>
                {msg.content}
              </div>
              <span style={styles.time}>{formatTime(msg.createdAt)}</span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {error ? <p style={styles.errorText}>{error}</p> : null}

      <div style={styles.inputRow}>
        <textarea
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn... (Enter để gửi)"
          rows={2}
          disabled={sending || !roomId}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !input.trim() || !roomId}
          style={styles.sendBtn}
        >
          {sending ? '...' : 'Gửi'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginTop: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.6rem 1rem',
    backgroundColor: '#0f766e',
    color: '#fff',
    fontWeight: 600,
  },
  refreshBtn: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
    minHeight: '220px',
    maxHeight: '360px',
    backgroundColor: '#f9fafb',
  },
  empty: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: '2rem',
    fontSize: '0.9rem',
  },
  senderLabel: {
    fontSize: '0.72rem',
    color: '#6b7280',
    marginBottom: '2px',
  },
  bubble: {
    maxWidth: '70%',
    padding: '0.5rem 0.85rem',
    borderRadius: '16px',
    fontSize: '0.9rem',
    lineHeight: 1.5,
    wordBreak: 'break-word',
  },
  bubbleMine: {
    backgroundColor: '#0f766e',
    color: '#fff',
    borderBottomRightRadius: '4px',
  },
  bubbleOther: {
    backgroundColor: '#e5e7eb',
    color: '#111827',
    borderBottomLeftRadius: '4px',
  },
  time: {
    fontSize: '0.68rem',
    color: '#9ca3af',
    marginTop: '2px',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '0.82rem',
    padding: '0 1rem',
  },
  inputRow: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.6rem',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    resize: 'none',
    padding: '0.4rem 0.6rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
  },
  sendBtn: {
    padding: '0 1.2rem',
    backgroundColor: '#0f766e',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    alignSelf: 'flex-end',
  },
}
