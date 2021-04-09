import { emitter } from "./emitter.js"
import { log } from "../../logs.js"
import chalk from "chalk"
import { CHAT_EVENT } from "../../../events.js"

emitter.on(
  CHAT_EVENT, 
  
  /**
   * @param {WebSocket} socket
   * @param {Buffer} payload
   */
  (socket, payload) => {
    log(chalk.gray(payload.toString("utf8")))
  }
)
