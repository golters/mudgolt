import WebSocket from 'ws'
import * as crypto from "../crypto"
import { createSign } from "crypto"
import { emitter } from "./events"
import { log } from "../logs"

export const client = new WebSocket('ws://localhost:1234', {
  headers: {
    "public-key": Buffer.from(crypto.keys.publicKey).toString("base64")
  }
})

export const sendEvent = (code: string, payload: any) => {
  const sign = createSign('SHA256')

  sign.update(payload)
  sign.end()

  const signature = sign.sign(Buffer.from(crypto.keys.privateKey))

  client.send(Buffer.concat([
    Buffer.from([Number(code)]),
    signature,
    Buffer.from(payload),
  ]))
}

client.on('open', () => {
  log("Connected to server")
})

client.on('message', (buffer: Buffer) => {
  const code = buffer[0]
  const payload = buffer.slice(1)

  // log(`Received event ${code}`)

  emitter.emit(String(code), client, payload)
})