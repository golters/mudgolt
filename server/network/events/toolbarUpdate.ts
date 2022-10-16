import {
  NetworkEventHandler,
  networkEmitter,
} from "./emitter"
import {
  sendEvent,
} from "../"
import {
  TOOLBAR_UPDATE_EVENT,
  ERROR_EVENT,
  DOOR_UPDATE_EVENT,
} from "../../../events"
import {
  getRoomById,
} from "../../services/room"
import {
  getDoorByRoom,
} from "../../services/door"
import {
  Room,
  Door,
} from "../../../@types"
import {
  broadcastToUser,
} from "../../network"

const handler: NetworkEventHandler = async (socket, nothing: string, player) => {
  try {
    const doors = await getDoorByRoom(player.roomId)
    broadcastToUser<Door[]>(DOOR_UPDATE_EVENT, doors, player.username)

  }catch(error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(TOOLBAR_UPDATE_EVENT, handler)
