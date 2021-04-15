import { networkEmitter, NetworkEventHandler } from "./emitter"
import { ERROR_EVENT } from "../../../../events"

const handler: NetworkEventHandler = (message: string) => {
  console.error('Error: ' + message)
}

networkEmitter.on(ERROR_EVENT, handler)
