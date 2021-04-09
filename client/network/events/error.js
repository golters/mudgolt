import { emitter } from "./emitter.js"

export const ERROR_EVENT = 0

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
