import { emitter, EventHandler } from "./emitter"
import { log } from "../../logs"
import chalk from "chalk"
import { CHAT_EVENT, ERROR_EVENT } from "../../../events"

const handler: EventHandler = (socket, payload) => {
  log(chalk.red('Error: ' + payload.toString("utf8")))
}

emitter.on(ERROR_EVENT, handler)
