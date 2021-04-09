import WebSocket from 'ws'
import { emitter } from './events'
import { createVerify } from "crypto"
import { ERROR_EVENT } from '../../events'

export const server = new WebSocket.Server({
  port: 1234
})

export const broadcast = (code: string, payload: any) => {
  server.clients.forEach((socket) => {
    sendEvent(socket, code, payload)
  })
}

export const sendEvent = (socket: WebSocket, code: string, payload: any) => {
  socket.send(Buffer.concat([
    Buffer.from([Number(code)]),
    Buffer.from(payload)
  ]))
}

server.on('connection', (socket, request) => {
  console.log('Socket connected to server')

  const publicKey = Buffer.from(request.headers["public-key"] as string, "base64").toString("utf-8")

  socket.on('message', (buffer: Buffer) => {
    const code = buffer[0]
    const signature = buffer.slice(1, 65)
    const payload = buffer.slice(65)

    const verify = createVerify('SHA256')
    verify.update(payload)
    verify.end()

    console.log(`Received event ${code}`)

    if (!verify.verify(publicKey, signature)) {
      sendEvent(socket, ERROR_EVENT, "Invalid signature")

      return
    }

    emitter.emit(code as unknown as string, socket, payload)
  })

  socket.on("close", (socket) => {
    console.log("Socket disconnected from server")
  })
})
