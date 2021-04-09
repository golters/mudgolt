import WebSocket from 'ws'
import { CHAT_EVENT } from '../../server/network/events/index.js'
import * as crypto from "../crypto.js"
import { createSign } from "crypto"
import { emitter } from "./events/index.js"

const client = new WebSocket('ws://localhost:1234', {
  headers: {
    "public-key": Buffer.from(crypto.keys.publicKey).toString("base64")
  }
})

/**
 * @param {number} code
 * @param {any} payload
 */
client.sendEvent = (code, payload) => {
  const sign = createSign('SHA256')

  sign.update(payload)
  sign.end()

  const signature = sign.sign(Buffer.from(crypto.keys.privateKey))

  client.send(Buffer.concat([
    Buffer.from([code]),
    signature,
    Buffer.from(payload),
  ]))
}

client.on('open', () => {
  console.log("Connected to server")

  client.sendEvent(CHAT_EVENT, "test")
})

client.on('message', (buffer) => {
  const code = buffer[0]
  const payload = buffer.slice(1)

  console.log(`Received event ${code}`)

  emitter.emit(code, client, payload)
})