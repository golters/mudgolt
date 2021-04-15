import { networkEmitter, NetworkEventHandler } from "./emitter"
import { LOG_EVENT, SERVER_LOG_EVENT } from "../../../../events"
import { commandEmitter } from "../../commands/emitter"
import { LogItem } from "../../components/terminal"

const handler: NetworkEventHandler = (message: string) => {
  const log = LogItem(message)
  log.style.fontStyle = "italic"
  log.style.opacity = "0.7"

  commandEmitter.emit(LOG_EVENT, log)
}

networkEmitter.on(SERVER_LOG_EVENT, handler)
