import { io } from 'socket.io-client'
import { ENV } from '../constants/env'

let socketInstance = null

function getSocket() {
  if (!socketInstance) {
    socketInstance = io(ENV.socketUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    })
  }
  return socketInstance
}

export function connectSocket(userId) {
  const socket = getSocket()
  if (!socket.connected) {
    socket.connect()
  }
  if (userId) {
    socket.emit('join-user-room', { userId })
  }
  return socket
}

export function disconnectSocket() {
  if (socketInstance && socketInstance.connected) {
    socketInstance.disconnect()
  }
}

export function subscribeAppointmentEvents(handler) {
  const socket = getSocket()
  socket.on('appointment:created', handler)
  socket.on('appointment:cancelled', handler)

  return () => {
    socket.off('appointment:created', handler)
    socket.off('appointment:cancelled', handler)
  }
}

export function joinChatRoom(roomId) {
  const socket = getSocket()
  if (!socket.connected) {
    socket.connect()
  }
  if (roomId) {
    socket.emit('join-chat-room', { roomId })
  }
}

export function leaveChatRoom(roomId) {
  const socket = getSocket()
  if (roomId) {
    socket.emit('leave-chat-room', { roomId })
  }
}

export function subscribeChatMessageEvents(handler) {
  const socket = getSocket()
  socket.on('chat:message', handler)

  return () => {
    socket.off('chat:message', handler)
  }
}

export function subscribeChatRoomUpdateEvents(handler) {
  const socket = getSocket()
  socket.on('chat:room-updated', handler)

  return () => {
    socket.off('chat:room-updated', handler)
  }
}
