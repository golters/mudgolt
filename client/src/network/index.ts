import { emitter } from "./events"
import { CHAT_EVENT } from "../../../events"

export const client = new WebSocket(`ws://localhost:1234?public-key=${btoa(localStorage.publicKey)}`)

export const sendEvent = async (code: string, payload: any) => {
  client.send(JSON.stringify({
    code,
    payload,
  }))
}

client.addEventListener('open', () => {
  console.log("Connected to server")
})

client.addEventListener('message', (event) => {
  const { code, payload } = JSON.parse(event.data) as {
    code: string
    payload: any
  }

  // log(`Received event ${code}`)

  console.log({ code, payload })

  emitter.emit(code, client, payload)
})