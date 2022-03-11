import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  sendEvent,
} from ".."
import {
  ME_EVENT,
  SERVER_LOG_EVENT,
  ERROR_EVENT,
  NOTIFICATION_EVENT,
} from "../../../events"
import {
  Player,
} from "../../../@types"
import {
  broadcastToRoom,
} from "../../network"
import {
  getRoomById,
} from "../../services/room"
import {
  insertRoomCommand,
} from "../../services/chat"

const handler: NetworkEventHandler = async (
  socket,
  message: string,
  player: Player,
) => {
  try {
    const room = await getRoomById(player.roomId)      
    broadcastToRoom<string>(SERVER_LOG_EVENT, player.username + " " + message, room.id);
    await insertRoomCommand(room.id, player.id, message, Date.now(), "me")
    broadcastToRoom<string>(NOTIFICATION_EVENT, "me", room.id);
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(ME_EVENT, handler)
