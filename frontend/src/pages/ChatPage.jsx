import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../features/auth/useAuth'
import {
  ensureChatRoomApi,
  getChatMessagesApi,
  getChatRoomsApi,
  sendChatMessageApi,
} from '../shared/api/chatApi'
import { getUsersApi } from '../shared/api/userManagementApi'
import {
  joinChatRoom,
  leaveChatRoom,
  subscribeChatMessageEvents,
  subscribeChatRoomUpdateEvents,
} from '../shared/realtime/socketService'

function formatDateTime(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString('vi-VN')
}

function getRoomLabel(room, role) {
  if (role === 'patient') {
    return `Nhân viên: ${room.staffUser?.name || room.peerUser?.name || 'N/A'}`
  }
  return `Bệnh nhân: ${room.patientUser?.name || room.peerUser?.name || 'N/A'}`
}

export function ChatPage() {
  const { user } = useAuth()
  const role = user?.role
  const [rooms, setRooms] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [draft, setDraft] = useState('')
  const [patients, setPatients] = useState([])
  const [selectedPatientUserId, setSelectedPatientUserId] = useState('')

  const selectedRoom = useMemo(
    () => rooms.find((item) => item._id === selectedRoomId) || null,
    [rooms, selectedRoomId],
  )

  const loadRooms = useCallback(async () => {
    const roomData = await getChatRoomsApi()
    setRooms(roomData)
    setSelectedRoomId((current) => current || roomData[0]?._id || '')
  }, [])

  const loadMessages = useCallback(async (roomId) => {
    if (!roomId) {
      setMessages([])
      return
    }
    const messageData = await getChatMessagesApi(roomId)
    setMessages(messageData)
  }, [])

  const bootstrap = useCallback(async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (role === 'patient') {
        // Ensure every patient can open at least one room with staff.
        await ensureChatRoomApi({})
      }

      await loadRooms()

      if (role === 'staff') {
        const patientUsers = await getUsersApi({ role: 'patient' })
        setPatients(patientUsers)
        setSelectedPatientUserId((current) => current || patientUsers[0]?._id || '')
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể tải dữ liệu chat.')
    } finally {
      setLoading(false)
    }
  }, [role, loadRooms])

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  useEffect(() => {
    void loadMessages(selectedRoomId)
  }, [selectedRoomId, loadMessages])

  useEffect(() => {
    if (!selectedRoomId) return undefined
    joinChatRoom(selectedRoomId)

    return () => {
      leaveChatRoom(selectedRoomId)
    }
  }, [selectedRoomId])

  useEffect(() => {
    const unsubscribeMessages = subscribeChatMessageEvents((payload) => {
      if (!payload?.roomId || !payload?.message) return
      if (payload.roomId === selectedRoomId) {
        setMessages((current) => [...current, payload.message])
      }
    })

    const unsubscribeRoomUpdates = subscribeChatRoomUpdateEvents(() => {
      void loadRooms()
    })

    return () => {
      unsubscribeMessages()
      unsubscribeRoomUpdates()
    }
  }, [selectedRoomId, loadRooms])

  const handleCreateRoom = async () => {
    if (role !== 'staff') return
    if (!selectedPatientUserId) {
      setError('Nhân viên cần chọn bệnh nhân để bắt đầu chat.')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')
    try {
      const room = await ensureChatRoomApi({ patientUserId: selectedPatientUserId })
      await loadRooms()
      setSelectedRoomId(room._id)
      setMessage('Đã mở cuộc trò chuyện mới với bệnh nhân.')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể tạo phòng chat mới.')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    const content = draft.trim()
    if (!selectedRoomId || !content) return

    setSending(true)
    setError('')
    try {
      await sendChatMessageApi(selectedRoomId, content)
      setDraft('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể gửi tin nhắn.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section>
      <h1>Chat hỗ trợ bệnh nhân - nhân viên</h1>
      <p>Trao đổi nhanh giữa bệnh nhân và nhân viên tiếp nhận qua thời gian thực.</p>

      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="muted">{message}</p> : null}

      {role === 'staff' ? (
        <div className="panel">
          <h2>Tạo cuộc trò chuyện mới</h2>
          <label htmlFor="chat-patient">Bệnh nhân</label>
          <select
            id="chat-patient"
            value={selectedPatientUserId}
            onChange={(event) => setSelectedPatientUserId(event.target.value)}
            disabled={loading || sending}
          >
            <option value="">Chọn bệnh nhân</option>
            {patients.map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.name} ({patient.email})
              </option>
            ))}
          </select>
          <div className="actions">
            <button type="button" onClick={handleCreateRoom} disabled={loading || sending || !selectedPatientUserId}>
              Mở chat với bệnh nhân
            </button>
          </div>
        </div>
      ) : null}

      <div className="panel" style={{ display: 'grid', gap: '14px' }}>
        <h2>Hội thoại</h2>

        <label htmlFor="chat-room">Chọn hội thoại</label>
        <select
          id="chat-room"
          value={selectedRoomId}
          onChange={(event) => setSelectedRoomId(event.target.value)}
          disabled={loading || sending}
        >
          {rooms.length === 0 ? <option value="">Chưa có hội thoại</option> : null}
          {rooms.map((room) => (
            <option key={room._id} value={room._id}>
              {getRoomLabel(room, role)}
            </option>
          ))}
        </select>

        <div className="status-box" style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {selectedRoom ? (
            <p className="muted" style={{ marginTop: 0 }}>
              Đang chat với {getRoomLabel(selectedRoom, role)}
            </p>
          ) : null}

          {messages.length === 0 ? <p className="muted">Chưa có tin nhắn nào.</p> : null}

          {messages.map((chatMessage) => {
            const isMine = String(chatMessage.sender?._id) === String(user?._id || user?.id)
            return (
              <div
                key={chatMessage._id}
                style={{
                  marginTop: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #dbe8ea',
                  background: isMine ? '#e7f7f4' : '#fff',
                }}
              >
                <strong>{chatMessage.sender?.name || 'Unknown'}</strong>
                <p style={{ marginTop: '6px', color: '#1f2d30' }}>{chatMessage.content}</p>
                <p className="muted" style={{ marginTop: '6px' }}>{formatDateTime(chatMessage.createdAt)}</p>
              </div>
            )
          })}
        </div>

        <label htmlFor="chat-draft">Soạn tin nhắn</label>
        <textarea
          id="chat-draft"
          rows="3"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={loading || sending || !selectedRoomId}
          placeholder="Nhập nội dung tin nhắn..."
        />

        <div className="actions">
          <button
            type="button"
            onClick={handleSend}
            disabled={loading || sending || !selectedRoomId || !draft.trim()}
          >
            {sending ? 'Đang gửi...' : 'Gửi tin nhắn'}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => void loadMessages(selectedRoomId)}
            disabled={loading || sending || !selectedRoomId}
          >
            Tải lại tin nhắn
          </button>
        </div>
      </div>
    </section>
  )
}
