import {
  Chat,
  Player,
} from "../../../@types"
import {
  CHAT_EVENT,
  CHAT_HISTORY_EVENT,
  PLAYER_EVENT,
  LOOK_EVENT,
  PAY_EVENT,
  INBOX_HISTORY_EVENT,
  WHISPER_LOG_EVENT,
  COMMAND_LOG_EVENT,
  PING_EVENT,
  MUSIC_EVENT,
  TP_EVENT,
  LOG_EVENT,
  UFO_EVENT,
  PONG_EVENT,
} from "../../../events"
import {
  store,
} from "../store"
import {
  networkEmitter,
} from "./events"
import {
  RECONNECT_DELAY,
} from "../../../constants"
import {
  pushErrorToLog,
  pushToLog,
} from "../components/Terminal"
import {
  iconUtil,
} from "../utils/icon"

import { cryptoTask } from "../crypto"
import { signChallenge } from "./events/auth"
import { AUTH_EVENT, ERROR_EVENT } from "../../../events"

export let client: WebSocket
export const context = new AudioContext()

// @ts-ignore -- supplied by Vite
const host = NODE_ENV === "development"
  // @ts-ignore -- supplied by Vite
  ? `${location.hostname}:${PORT || 1234}`
  : location.host

let connectionTask: Promise<void> | undefined
let initializeKeys: Promise<void> | undefined
let reconnectTimer: ReturnType<typeof setTimeout> | undefined
let authenticated = false
let requestedChat = false

export const sendEvent = async <TPayload,>(code: string, payload: TPayload) => {
  await networkTask()
  // A disconnect can occur between awaiting readiness and sending.
  if (!authenticated || client.readyState !== WebSocket.OPEN) {
    connectionTask = undefined
    return sendEvent(code, payload)
  }
  client.send(JSON.stringify({ code, payload }))
}

export const networkTask = (): Promise<void> => {
  if (connectionTask) return connectionTask
  if (reconnectTimer) clearTimeout(reconnectTimer)
  connectionTask = new Promise<void>((resolve, reject) => {
    let ready = false
    const connect = async () => {
      try {
        await (initializeKeys ??= cryptoTask())
        const socket = new WebSocket(`${location.protocol === "https:" ? "wss:" : "ws:"}//${host}/ws?public-key=${encodeURIComponent(localStorage.publicKey)}`)
        client = socket
        authenticated = false
        const send = (code: string, payload: unknown) => {
          if (client === socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ code, payload }))
          }
        }
        socket.addEventListener("message", async (event) => {
          if (client !== socket) return
          try {
            const { code, payload } = JSON.parse(event.data)
            console.log(`[${code}]`, payload)
            if (code === AUTH_EVENT) {
              // Signing is asynchronous: never send an old challenge on a new socket.
              send(AUTH_EVENT, await signChallenge(payload))
              return
            }
            if (code === ERROR_EVENT && !authenticated) {
              pushErrorToLog(String(payload))
              return
            }
            if (code === PLAYER_EVENT) {
              authenticated = true
              store.player = payload as Player
              if (!requestedChat) {
                const destination = new URLSearchParams(location.search).get("go")
                if (destination) send(TP_EVENT, destination)
                send(CHAT_HISTORY_EVENT, null)
                requestedChat = true
              } else {
                ready = true
                resolve()
              }
            }
            if (code === CHAT_HISTORY_EVENT) {
              for (const chat of payload as Chat[]) {
                networkEmitter.emit(chat.type === "chat" || chat.type === null ? CHAT_EVENT : COMMAND_LOG_EVENT, chat)
              }
              ready = true
              resolve()
            }
            if (code === INBOX_HISTORY_EVENT) {
              for (const chat of payload as Chat[]) networkEmitter.emit(WHISPER_LOG_EVENT, chat)
            }
            networkEmitter.emit(code, payload)
          } catch (error) {
            console.error(error)
          }
        })
        socket.addEventListener("close", () => {
          if (client !== socket) return
          authenticated = false
          requestedChat = false
          if (ready) connectionTask = undefined
          reconnectTimer = setTimeout(() => {
            if (ready) networkTask().catch(console.error)
            else void connect()
          }, RECONNECT_DELAY)
        })
      } catch (error) {
        initializeKeys = undefined
        connectionTask = undefined
        reject(error)
      }
    }
    void connect()
  })
  return connectionTask
}
setInterval(() => {
  if(!localStorage.getItem("muted")){
  networkEmitter.emit(MUSIC_EVENT, context)
  }
}, 15 * 10)

setTimeout(() => {
  sendEvent(PING_EVENT, null)
  sendEvent(PAY_EVENT, store.player?.id)
}, 15 * 1000)

//make settimeout then ping server, server return event to start a new timeout
networkEmitter.on(PONG_EVENT, () => {
  setTimeout(() => {
    if(localStorage.getItem("focus") === "open"){
      sendEvent(PING_EVENT, null)
    sendEvent(PAY_EVENT, store.player?.id)
    }else{
      if(Math.random()*10000 < 5){
      sendEvent(UFO_EVENT, store.player?.id)
      }
    }
  }, 15 * 1000)
})

window.addEventListener("focus", (event) => {
  localStorage.setItem("focus","open")
})

window.addEventListener("blur", (event) => {
  localStorage.setItem("focus","close")
  setTimeout(() => {
    if(localStorage.getItem("focus") !="open")
    window.addEventListener("focus", (event) => {
      window.location.reload()
  })
  }, 600 * 1000)
})
