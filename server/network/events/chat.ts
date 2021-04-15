import { networkEmitter, NetworkEventHandler } from "./emitter"
import { broadcast } from "../"
import { CHAT_EVENT } from "../../../events"

const handler: NetworkEventHandler = (socket, message: string, player) => {
  broadcast(CHAT_EVENT, {
    player,
    message,
  })
}

networkEmitter.on(CHAT_EVENT, handler)
