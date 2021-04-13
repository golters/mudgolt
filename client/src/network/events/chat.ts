import { emitter, EventHandler } from "./emitter"
import { log } from "../../logs"
import { CHAT_EVENT } from "../../../../events"

const handler: EventHandler = (socket, payload) => {
  log(payload.toString("utf8"))
}

emitter.on(CHAT_EVENT, handler)
