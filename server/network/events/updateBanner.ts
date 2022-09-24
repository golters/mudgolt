import {
  NetworkEventHandler,
  networkEmitter,
} from "./emitter"
import {
  sendEvent,
} from "../"
import {
  UPDATE_BANNER_EVENT,
  ERROR_EVENT,
  ROOM_UPDATE_EVENT,
} from "../../../events"
import {
  getRoomById,
} from "../../services/room"
import {
  Room,
} from "../../../@types"
import {
  broadcastToRoom,
} from "../../network"

const handler: NetworkEventHandler = async (socket, nothing: string, player) => {
  try {
    const room = await getRoomById(player.roomId)
    broadcastToRoom<Room>(ROOM_UPDATE_EVENT, room, room.id)

  }catch(error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(UPDATE_BANNER_EVENT, handler)
