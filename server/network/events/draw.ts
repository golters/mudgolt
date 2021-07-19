import {
	NetworkEventHandler,
	networkEmitter,
} from "./emitter"
import {
	online,
	sendEvent,
	broadcastToRoom,
} from "../"
import {
	DRAW_EVENT,
	ERROR_EVENT,
} from "../../../events"
import {
	getRoomById,
	editBaner,
} from "../../services/room"
import {
	Room
} from "@types"


const handler: NetworkEventHandler = async (socket, payload: string, player) => {
	try {
		const room = await getRoomById(player.roomId)
		let [x, y, char] = payload
		await editBaner(x, y, char, room)
	}catch(error) {
		sendEvent<string>(socket, ERROR_EVENT, error.message)
		console.error(error)
	}
}

networkEmitter.on(DRAW_EVENT, handler)