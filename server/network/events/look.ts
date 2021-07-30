import {
  NetworkEventHandler,
  networkEmitter,
} from "./emitter"
import {
  online,
  sendEvent,
} from "../"
import {
  LOOK_EVENT,
	LOG_EVENT,
	ERROR_EVENT,
} from "../../../events"
import { getRoomById } from "../../services/room"
import { getDoorByRoom } from "../../services/door"
import { debug } from "console"
import {
	broadcastToRoom,
} from "../../network"
import {
	Player,
	Door
} from "@types"
import {
	db,
} from "../../store"
import { forEachChild } from "typescript"


const handler: NetworkEventHandler = async (socket, roomID: string, player) => {
  try {
	  const room = await getRoomById(player.roomId)

	  let message = `${room?.description}\nyou see`

	  online.forEach(({ player }) => {
		  if (player.roomId == room?.id) {
			  message = `${message} ${player?.username}`
		}
	  })
	  const doors = await getDoorByRoom(player.roomId)
	  const names = doors.map(x => x.name);
	  if (doors) {
		  message = `${message}\nthe exits are ${names}`
	  } else {
		  message = `${message}\nthere are no exits`
	  }
	  

	  sendEvent<string>(socket, LOG_EVENT, message)

  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
	}
}

networkEmitter.on(LOOK_EVENT, handler)