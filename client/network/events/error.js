import { emitter } from "./emitter.js"
import { ERROR_EVENT } from "../../../events.js"

emitter.on(
  ERROR_EVENT, 
  
  /**
   * @param {WebSocket} socket
   * @param {Buffer} payload
   */
  (socket, payload) => {
    console.error('Error:', payload.toString("utf8"))
  }
)
