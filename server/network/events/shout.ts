import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  sendEvent,
} from ".."
import {
  SHOUT_EVENT,
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
import { getDoorByRoom } from "../../services/door"
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
    message = message.toUpperCase() + "!"
    const doors = await getDoorByRoom(player.roomId)    
    broadcastToRoom<string>(SERVER_LOG_EVENT, player.username + " shouted " + message, room.id);
    broadcastToRoom<string>(NOTIFICATION_EVENT, "shout", room.id);
    await insertRoomCommand(room.id, player.id, "shouted " + message, Date.now(), "shout")
    for (let i = 0; i < doors.length; i++){
      broadcastToRoom<string>(NOTIFICATION_EVENT, "shout", doors[i].target_room_id)
      broadcastToRoom<string>(SERVER_LOG_EVENT, player.username + " shouted " + message + " from " + room.name, doors[i].target_room_id)
      await insertRoomCommand(doors[i].target_room_id, player.id, " shouted" + message + " from " + room.name, Date.now(), "shout")
    }

  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(SHOUT_EVENT, handler)
