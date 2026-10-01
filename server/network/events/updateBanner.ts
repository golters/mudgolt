import {
  type NetworkEventHandler,
  networkEmitter,
} from "./emitter.ts"
import {
  sendEvent,
} from "../index.ts"
import {
  UPDATE_BANNER_EVENT,
  ERROR_EVENT,
  ROOM_UPDATE_EVENT,
} from "../../../events.ts"
import {
  getRoomById,
} from "../../services/room.ts"
import type {
  Room,
} from "../../../@types/index.ts"
import {
  broadcastToRoom,
} from "../../network/index.ts"

const handler: NetworkEventHandler = async (socket, nothing: string, player) => {
  try {
    const room = await getRoomById(player.roomId)
    broadcastToRoom<Room>(ROOM_UPDATE_EVENT, room, room.id)

  }catch(error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(UPDATE_BANNER_EVENT, handler)
