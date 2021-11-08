import {
  NetworkEventHandler,
  networkEmitter,
} from "./emitter"
import {
  online,
  sendEvent,
} from "../"
import {
  ONLINE_EVENT,
  LOG_EVENT,
  ERROR_EVENT,
} from "../../../events"

const handler: NetworkEventHandler = async (socket, roomID: string, player) => {
  try {

    let message = "online ("+ online.length + "):\n"

    online.forEach(({ player }) => {
      message = `${message} ${player.username}\n`
    })

    sendEvent<string>(socket, LOG_EVENT, message)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(ONLINE_EVENT, handler)
