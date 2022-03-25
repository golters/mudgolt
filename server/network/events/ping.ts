import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  PING_EVENT, 
} from "../../../events"
import {
  online,
  sendEvent, 
} from "../"

const handler: NetworkEventHandler = (socket) => {
  sendEvent<null>(socket, PING_EVENT, null)
}

networkEmitter.on(PING_EVENT, handler)
