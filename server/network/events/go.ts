import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  ERROR_EVENT,
  GO_EVENT,
  ROOM_UPDATE_EVENT,
  SERVER_LOG_EVENT,
  LOG_EVENT,
} from "../../../events"
import {
  broadcastToRoom,
  sendEvent,
} from "../../network"
import {
  setPlayerRoomByName, 
} from "../../services/player"
import { getRoomById,lookByID } from "../../services/room"
import { getDoorByName, getTargetDoor } from "../../services/door"
import {
  Room,
} from "@types"

const handler: NetworkEventHandler = async (socket, doorName: string, player) => {
  try {
    const oldRoom = await getRoomById(player.roomId)
    
    await getDoorByName(player.roomId, doorName);

    const { target_room_id: roomId } = await getTargetDoor(oldRoom.id, doorName)

    const newRoom = await getRoomById(roomId)

    if (oldRoom.name === newRoom.name) {
      return
    }

    if (typeof newRoom.name !== "string") {
      sendEvent<string>(socket, ERROR_EVENT, "name not string")

      return
    }

    const room = await setPlayerRoomByName(player.id, newRoom.name.replace(/\s/g, "_"))	  

    const message = await lookByID(newRoom.id)


    broadcastToRoom<Room>(ROOM_UPDATE_EVENT, oldRoom, oldRoom.id)
    broadcastToRoom<string>(SERVER_LOG_EVENT, `${player.username} has left ${oldRoom.name} through the ${doorName}`, oldRoom.id)
    broadcastToRoom<Room>(ROOM_UPDATE_EVENT, room, room.id)
    broadcastToRoom<string>(SERVER_LOG_EVENT, `${player.username} has joined ${room.name}`, room.id)
    sendEvent<string>(socket, LOG_EVENT, message)    
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(GO_EVENT, handler)
