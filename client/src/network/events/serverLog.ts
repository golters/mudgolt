import { emitter, EventHandler } from "./emitter"
import { LOG_EVENT, SERVER_LOG_EVENT } from "../../../../events"
import { commandEmitter } from "../../commands"
import { LogItem } from "../../components/terminal"

const handler: EventHandler = (socket, payload) => {
  const log = LogItem(payload)
  log.style.fontStyle = "italic"
  log.style.opacity = "0.7"

  commandEmitter.emit(LOG_EVENT, log)
}

emitter.on(SERVER_LOG_EVENT, handler)
