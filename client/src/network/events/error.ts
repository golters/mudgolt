import { emitter, EventHandler } from "./emitter"
import { ERROR_EVENT } from "../../../../events"

const handler: EventHandler = (socket, payload) => {
  console.error('Error: ' + payload.toString("utf8"))
}

emitter.on(ERROR_EVENT, handler)
