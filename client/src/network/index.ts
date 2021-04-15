import { Player } from "../../../@types"
import { PLAYER_EVENT } from "../../../events"
import { store } from "../store"
import { emitter } from "./events"

export let client: WebSocket

export const sendEvent = async (code: string, payload: any) => {
  client.send(JSON.stringify({
    code,
    payload,
  }))
}

export const networkTask = () => new Promise<void>((resolve) => {
  client = new WebSocket(`ws://localhost:1234?public-key=${encodeURIComponent(localStorage.publicKey)}`)

  client.addEventListener('open', () => {
    console.log("Connected to server")
  })
  
  client.addEventListener('message', (event) => {
    const { code, payload } = JSON.parse(event.data) as {
      code: string
      payload: any
    }

    if (code === PLAYER_EVENT) {
      const player: Player = payload

      store.player = player

      resolve()
    }
  
    emitter.emit(code, payload)
  })
})