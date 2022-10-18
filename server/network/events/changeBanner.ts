import {
  NetworkEventHandler,
  networkEmitter,
} from "./emitter"
import {
  sendEvent,
} from "../"
import {
  CHANGE_BANNER_EVENT,
  ERROR_EVENT,
  ROOM_UPDATE_EVENT,
} from "../../../events"
import {
  getRoomById,
} from "../../services/room"
import { Room } from "../../../@types"

const handler: NetworkEventHandler = async (socket, roomID: number) => {
  try {
    const room = await getRoomById(roomID)
    sendEvent<Room>(socket, ROOM_UPDATE_EVENT, room)

  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(CHANGE_BANNER_EVENT, handler)
