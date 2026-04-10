import { httpClient } from './httpClient'

// Bệnh nhân lấy tin nhắn của phòng mình
// Staff lấy tin nhắn theo roomId (patientId)
export async function getChatMessagesApi(roomId = null) {
  const params = roomId ? { roomId } : {}
  const { data } = await httpClient.get('/api/chat/messages', { params })
  return data
}

// Gửi tin nhắn qua REST (fallback nếu socket không khả dụng)
export async function sendChatMessageApi({ content, roomId = null }) {
  const payload = { content }
  if (roomId) payload.roomId = roomId
  const { data } = await httpClient.post('/api/chat/messages', payload)
  return data
}

// Staff lấy danh sách các phòng chat
export async function getChatRoomsApi() {
  const { data } = await httpClient.get('/api/chat/rooms')
  return data
}

// Staff đánh dấu đã đọc
export async function markChatRoomReadApi(roomId) {
  const { data } = await httpClient.post(`/api/chat/rooms/${roomId}/read`)
  return data
}
