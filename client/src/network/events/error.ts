import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  ERROR_EVENT,
} from "../../../../events"
import {
  pushErrorToLog, 
} from "../../components/Terminal"

const handler: NetworkEventHandler = (message: string) => {
  pushErrorToLog(`Error: ${message}`)
}

networkEmitter.on(ERROR_EVENT, handler)
