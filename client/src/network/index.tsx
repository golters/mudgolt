import {
  Chat,
  Player, 
} from "../../../@types"
import {
  CHAT_EVENT,
  CHAT_HISTORY_EVENT,
  PLAYER_EVENT, 
  LOOK_EVENT,
} from "../../../events"
import {
  store, 
} from "../store"
import {
  networkEmitter, 
} from "./events"
import {
  PING_EVENT, 
} from "../../../events"
import {
  RECONNECT_DELAY,
} from "../../../constants"
import {
  pushErrorToLog, 
  pushToLog,
} from "../components/Terminal"

export let client: WebSocket

// TSX doens't like generics
export const sendEvent = async <TPayload,> (code: string, payload: TPayload) => {
  client.send(JSON.stringify({
    code,
    payload,
  }))
}

// @ts-ignore
const host = NODE_ENV === "development"
  // @ts-ignore
  ? `${location.hostname}:${PORT || 1234}`
  : location.host

let reconnectAttempts = 0
let requestedChat = false

export const networkTask = () => new Promise<void>((resolve) => {
  client = new WebSocket(`${location.protocol === "https:" ? "wss:" : "ws:"}//${host}/ws?public-key=${encodeURIComponent(localStorage.publicKey)}`)

  reconnectAttempts++

  client.addEventListener("open", () => {
    pushToLog("Connected to server")

    reconnectAttempts = 0
  })
  
  client.addEventListener("message", (event) => {
    const { code, payload } = JSON.parse(event.data) as {
      code: string
      payload: unknown
    }

    console.log(`[${code}]`, payload)

    if (code === PLAYER_EVENT) {
      const player = payload as Player

      store.player = player

      if (requestedChat) {
        resolve()
      } else {
        sendEvent<null>(CHAT_HISTORY_EVENT, null)
        requestedChat = true
      }
    }

    if (code === CHAT_HISTORY_EVENT) {
      void (payload as Chat[]).forEach(chat => networkEmitter.emit(CHAT_EVENT, chat))
      sendEvent(LOOK_EVENT, store.player?.roomId)

      resolve()
    }
  
    networkEmitter.emit(code, payload)
  })

  client.addEventListener("close", () => {
    pushErrorToLog(`Disconnected from server. Reconnecting...`)

    if (reconnectAttempts === 0) {
      networkTask().catch(console.error)
    } else {
      setTimeout(() => {
        networkTask().catch(console.error)
      }, RECONNECT_DELAY)
    }
  })
})

setInterval(() => {
  sendEvent(PING_EVENT, null)
}, 15 * 1000)
