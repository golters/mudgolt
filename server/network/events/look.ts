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
	SERVER_LOG_EVENT,
} from "../../../events"
import { getRoomById } from "../../services/room"
import { debug } from "console"
import {
	broadcastToRoom,
} from "../../network"
import { Player } from "@types"


const handler: NetworkEventHandler = async (socket, roomID: string, player) => {
  try {
	  const room = await getRoomById(player.roomId)

	  let message = `${room?.description}\nyou see`

	  online.forEach(({ player }) => {
		  if (player.roomId == room?.id) {
			  message = `${message} ${player?.username}`
		}
	})	  
	  sendEvent<string>(socket, LOG_EVENT, message)
	  sendEvent<string>(socket, ERROR_EVENT, message)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
	}
}

networkEmitter.on(LOOK_EVENT, handler)