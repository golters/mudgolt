import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  ERROR_EVENT, LOG_EVENT, 
} from "../../../../events"
import {
  LogItem, 
} from "../../components/Terminal"
import {
  commandEmitter, 
} from "../../commands"

const handler: NetworkEventHandler = (message: string) => {
  const errorItem = LogItem(`Error: ${message}`)
  errorItem.classList.toggle("error-message")

  commandEmitter.emit(LOG_EVENT, errorItem)
}

networkEmitter.on(ERROR_EVENT, handler)
