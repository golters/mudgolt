import { emitter, EventHandler } from "./emitter"
import { broadcast } from "../"
import { CHAT_EVENT } from "../../../events"

const handler: EventHandler = (socket, payload, player) => {
  const message: string = payload

  broadcast(CHAT_EVENT, {
    player,
    message,
  })
}

emitter.on(CHAT_EVENT, handler)
