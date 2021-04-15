import { emitter, EventHandler } from "./emitter"
import { ERROR_EVENT } from "../../../../events"

const handler: EventHandler = (message: string) => {
  console.error('Error: ' + message)
}

emitter.on(ERROR_EVENT, handler)
