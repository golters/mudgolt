import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  LOG_EVENT,
} from "../../../../events"
import {
  pushToLog,
} from "../../components/Terminal"

const handler: NetworkEventHandler = (message: string) => {
  pushToLog(`${message}`)
}

networkEmitter.on(LOG_EVENT, handler)
