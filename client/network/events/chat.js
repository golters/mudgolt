import { emitter } from "./emitter.js"

export const CHAT_EVENT = 1

emitter.on(
  CHAT_EVENT, 
  
  /**
   * @param {WebSocket} socket
   * @param {Buffer} payload
   */
  (socket, payload) => {
    console.log(payload.toString("utf8"))
  }
)
