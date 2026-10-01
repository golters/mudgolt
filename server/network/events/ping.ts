import { networkEmitter, type NetworkEventHandler } from "./emitter.ts"
import { PING_EVENT, PONG_EVENT } from "../../../events.ts"
import { sendEvent } from "../index.ts"

const handler: NetworkEventHandler = (socket) => {
  sendEvent(socket, PING_EVENT, null)
  sendEvent(socket, PONG_EVENT, "pong")
}

networkEmitter.on(PING_EVENT, handler)
