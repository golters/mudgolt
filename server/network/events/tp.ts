import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  ERROR_EVENT,
  TP_EVENT,
  ROOM_UPDATE_EVENT,
  SERVER_LOG_EVENT,
  LOG_EVENT,
  NOTIFICATION_EVENT,
} from "../../../events"
import {
  broadcastToRoom,
  sendEvent,
} from "../../network"
import {
  setPlayerRoomByName,
} from "../../services/player"
import {
  getRoomById,
  getRoomByName,
  lookByID,
} from "../../services/room"
import { Room } from "@types"
import {
  TELEPORT_COST,
  GOLT,
} from "../../../constants"
import {
  insertRoomCommand,
} from "../../services/chat"

const handler: NetworkEventHandler = async (socket, roomNameInput: string, player) => {
  try {
    const oldRoom = await getRoomById(player.roomId)

    const newRoom = await getRoomByName(roomNameInput)
 
    if (!oldRoom) {
      sendEvent<string>(socket, ERROR_EVENT, "Room doesn't exist")

      return
    }
    if (!newRoom) {
      sendEvent<string>(socket, ERROR_EVENT, "Room doesn't exist")

      return
    }

    const roomName = roomNameInput.replace(/\s/g, "_")

    if (oldRoom.name === roomName) {
      sendEvent<string>(socket, ERROR_EVENT, "You're already there")

      return
    }
    const cost = TELEPORT_COST
    if(player.golts < cost){
      sendEvent<string>(socket, SERVER_LOG_EVENT, `you need ${GOLT}${cost}`)

      return
    } 

    sendEvent<string>(socket, SERVER_LOG_EVENT, `-${GOLT}${cost}`)
    const room = await setPlayerRoomByName(player.id, roomName)

    const message = await lookByID(room.id)

    broadcastToRoom<Room>(ROOM_UPDATE_EVENT, oldRoom, oldRoom.id)
    broadcastToRoom<string>(SERVER_LOG_EVENT, `${player.username} has teleported from ${oldRoom.name}`, oldRoom.id)
    broadcastToRoom<string>(NOTIFICATION_EVENT, "teleportExit", oldRoom.id);
    //await insertRoomCommand(oldRoom.id, player.id, `has teleported from ${oldRoom.name}`, Date.now(), "tp")
    broadcastToRoom<Room>(ROOM_UPDATE_EVENT, room, room.id)
    broadcastToRoom<string>(SERVER_LOG_EVENT, `${player.username} has teleported into ${room.name}`, room.id)
    broadcastToRoom<string>(NOTIFICATION_EVENT, "teleportEnter", room.id);
    //await insertRoomCommand(room.id, player.id, `has teleported into ${room.name}`, Date.now(), "tp")
    sendEvent<string>(socket, LOG_EVENT, message)    
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(TP_EVENT, handler)
