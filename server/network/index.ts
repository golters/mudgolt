import WebSocket from 'ws'
import { emitter } from './events'

export const server = new WebSocket.Server({
  port: 1234
})

export const broadcast = (code: string, payload: any) => {
  server.clients.forEach((socket) => {
    sendEvent(socket, code, payload)
  })
}

export const sendEvent = (socket: WebSocket, code: string, payload: any) => {
  socket.send(JSON.stringify({
    code,
    payload,
  }))
}

server.on('connection', (socket, request) => {
  console.log('Socket connected to server')

  // const base64PublicKey = querystring.parse(request.url!)['/?public-key'] as string

  socket.on('message', (data: string) => {
    const { code, payload} = JSON.parse(data) as {
      code: string
      payload: number[]
    }

    console.log(`Received event ${code}`)

    emitter.emit(code as unknown as string, socket, payload)
  })

  socket.on("close", (socket) => {
    console.log("Socket disconnected from server")
  })
})
