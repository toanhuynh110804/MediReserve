import { httpClient } from './httpClient'

export async function getChatRoomsApi() {
  const response = await httpClient.get('/api/chats/rooms')
  return response.data
}

export async function ensureChatRoomApi(payload = {}) {
  const response = await httpClient.post('/api/chats/rooms/ensure', payload)
  return response.data
}

export async function getChatMessagesApi(roomId, query = {}) {
  const response = await httpClient.get(`/api/chats/rooms/${roomId}/messages`, { params: query })
  return response.data
}

export async function sendChatMessageApi(roomId, content) {
  const response = await httpClient.post(`/api/chats/rooms/${roomId}/messages`, { content })
  return response.data
}
