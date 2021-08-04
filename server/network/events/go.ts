import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  ERROR_EVENT,
  LOG_EVENT,
  GO_EVENT,
  ROOM_UPDATE_EVENT,
  SERVER_LOG_EVENT,
} from "../../../events"
import {
  broadcastToRoom,
  sendEvent,
  online,
} from "../../network"
import {
  setPlayerRoomByName, 
} from "../../services/player"
import { getRoomById } from "../../services/room"
import { getDoorByName, getDoorByRoom } from "../../services/door"
import {
  Room,
  Door,
} from "@types"
import {
  db,
} from "../../store"


const handler: NetworkEventHandler = async (socket, doorName: string, player) => {
  try {
	  const oldRoom = await getRoomById(player.roomId)
	  console.log(oldRoom);
    if (!oldRoom) {
      sendEvent<string>(socket, ERROR_EVENT, "Room doesn't exist")
  
      return
	  }
	  const door = await getDoorByName(player.roomId, doorName);

	  const { target_room_id: roomId } = await db.get(/*sql*/`
SELECT target_room_id FROM doors WHERE "room_id" = $1 AND "name" = $2;
`, [oldRoom.id, doorName])

	  const newRoom = await getRoomById(roomId)
	  let roomName: string = newRoom?.name as string

	  if (oldRoom.name === roomName) {
      return
	  }

	  if (typeof roomName !== "string") {
		  sendEvent<string>(socket, ERROR_EVENT, "name not string")

		  return
	  }
	  roomName = roomName.replace(/\s/g, "_")

	  const room = await setPlayerRoomByName(player.id, roomName as string)	  
	  const doors = await getDoorByRoom(player.roomId)

	  let message = `${newRoom?.description}\nyou see`

	  online.forEach(({ player }) => {
		  if (player.roomId == room?.id) {
			  message = `${message} ${player?.username}`
		  }
	  })
	  const names = doors.map(x => x.name);
	  if (doors) {
		  message = `${message}\nthe exits are ${names}`
	  } else {
		  message = `${message}\nthere are no exits`
	  }

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
