import { emitter, EventHandler } from "./emitter"
import { log } from "../../logs"
import chalk from "chalk"
import { CHAT_EVENT } from "../../../events"

const handler: EventHandler = (socket, payload) => {
  log(chalk.gray(payload.toString("utf8")))
}

emitter.on(CHAT_EVENT, handler)
