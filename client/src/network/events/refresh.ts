import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  REFRESH_EVENT,
} from "../../../../events"
import { pushErrorToLog } from "../../components/Terminal"

const handler: NetworkEventHandler = () => {
  window.location.reload()  
  pushErrorToLog("sorry, something went wrong")
}

networkEmitter.on(REFRESH_EVENT, handler)
