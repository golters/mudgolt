import { emitter, EventHandler } from "./emitter"
import { broadcast } from "../"
import { CHAT_EVENT } from "../../../events"

const handler: EventHandler = (socket, payload) => {
  broadcast(CHAT_EVENT, payload)
}

emitter.on(CHAT_EVENT, handler)
