import { emitter } from "./emitter.js"
import { broadcast } from "../index.js"
import { CHAT_EVENT } from "../../../events.js"

emitter.on(
  CHAT_EVENT, 
  
  /**
   * @param {WebSocket} socket
   * @param {Buffer} payload
   */
  (socket, payload) => {
    broadcast(CHAT_EVENT, payload)
  }
)
