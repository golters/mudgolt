import {
  type NetworkEventHandler,
  networkEmitter,
} from "./emitter.ts"
import {
  sendEvent,
} from "../index.ts"
import {
  CHANGE_BANNER_EVENT,
  ERROR_EVENT,
  ROOM_UPDATE_EVENT,
} from "../../../events.ts"
import {
  getRoomById,
} from "../../services/room.ts"
import type { Room } from "../../../@types/index.ts"

const handler: NetworkEventHandler = async (socket, roomID: number) => {
  try {
    const room = await getRoomById(roomID)
    sendEvent<Room>(socket, ROOM_UPDATE_EVENT, room)

  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(CHANGE_BANNER_EVENT, handler)
