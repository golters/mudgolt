import WebSocket from 'ws'
import { emitter } from './events/index.js'
import { createVerify } from "crypto"
import { ERROR_EVENT } from '../../client/network/events/error.js'

export const server = new WebSocket.Server({
  port: 1234
})

server.on('connection', (socket, request) => {
  console.log('Socket connected to server')

  const publicKey = Buffer.from(request.headers["public-key"], "base64").toString("utf-8")

  socket.sendEvent = (code, payload) => {
    socket.send(Buffer.concat([
      Buffer.from([code]),
      Buffer.from(payload)
    ]))
  }

  socket.on('message', (buffer) => {
    const code = buffer[0]
    const signature = buffer.slice(1, 65)
    const payload = buffer.slice(65)

    const verify = createVerify('SHA256')
    verify.update(payload)
    verify.end()

    console.log(`Received event ${code}`)

    if (!verify.verify(publicKey, signature)) {
      socket.sendEvent(ERROR_EVENT, "Invalid signature")

      return
    }

    emitter.emit(code, socket, payload)
  })
})
