import { emitter, EventHandler } from "./emitter"
import { log } from "../../logs"
import { ERROR_EVENT } from "../../../../events"

const handler: EventHandler = (socket, payload) => {
  log('Error: ' + payload.toString("utf8"))
}

emitter.on(ERROR_EVENT, handler)
