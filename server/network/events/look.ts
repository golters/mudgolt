import {
  NetworkEventHandler,
  networkEmitter,
} from "./emitter"
import {
  sendEvent,
} from "../"
import {
  LOOK_EVENT,
  LOG_EVENT,
  ERROR_EVENT,
} from "../../../events"
import { lookByID } from "../../services/room"

const handler: NetworkEventHandler = async (socket, roomID: number, player) => {
  try {
    const message = await lookByID(player.roomId)

    sendEvent<string>(socket, LOG_EVENT, message)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(LOOK_EVENT, handler)
