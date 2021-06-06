import {
  Player, 
} from "../../../@types"
import {
  PLAYER_EVENT, 
} from "../../../events"
import {
  store, 
} from "../store"
import {
  networkEmitter, 
} from "./events"

export let client: WebSocket

export const sendEvent = async (code: string, payload: unknown) => {
  client.send(JSON.stringify({
    code,
    payload,
  }))
}

const host = process.env.NODE_ENV === "development"
  ? `${location.hostname}:${process.env.PORT || 1234}`
  : location.host

export const networkTask = () => new Promise<void>((resolve) => {
  client = new WebSocket(`ws://${host}?public-key=${encodeURIComponent(localStorage.publicKey)}`)

  client.addEventListener('open', () => {
    console.log("Connected to server")
  })
  
  client.addEventListener('message', (event) => {
    const { code, payload } = JSON.parse(event.data) as {
      code: string
      payload: unknown
    }

    if (code === PLAYER_EVENT) {
      const player = payload as Player

      store.player = player

      resolve()
    }
  
    networkEmitter.emit(code, payload)
  })
})
