import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  ERROR_EVENT,
  GO_EVENT,
  ROOM_UPDATE_EVENT,
  SERVER_LOG_EVENT,
} from "../../../events"
import {
  broadcastToRoom,
  sendEvent, 
} from "../../network"
import {
  setPlayerRoomByName, 
} from "../../services/player"
import { getRoomById } from "../../services/room"
import { Room } from "@types"

const handler: NetworkEventHandler = async (socket, roomName: string, player) => {
  try {
    const oldRoom = await getRoomById(player.roomId)
  
    if (!oldRoom) {
      sendEvent<string>(socket, ERROR_EVENT, `Room doesn't exist`)
  
      return
    }
  
    if (oldRoom.name === roomName) {
      return
    }

    roomName = roomName.replace(/\s/g, "_")

    const room = await setPlayerRoomByName(player.id, roomName)

    broadcastToRoom<Room>(ROOM_UPDATE_EVENT, oldRoom, oldRoom.id)
    broadcastToRoom<string>(SERVER_LOG_EVENT, `${player.username} has left ${oldRoom.name}`, oldRoom.id)
    broadcastToRoom<Room>(ROOM_UPDATE_EVENT, room, room.id)
    broadcastToRoom<string>(SERVER_LOG_EVENT, `${player.username} has joined ${room.name}`, room.id)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(GO_EVENT, handler)
