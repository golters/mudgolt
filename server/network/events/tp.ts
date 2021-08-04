import {
	networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
	ERROR_EVENT,
	LOG_EVENT,
	TP_EVENT,
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
import {
	getRoomById,
	getRoomByName
} from "../../services/room"
import { getDoorByName, getDoorByRoom } from "../../services/door"
import { Room } from "@types"

const handler: NetworkEventHandler = async (socket, roomName: string, player) => {
	try {
		const oldRoom = await getRoomById(player.roomId)

		if (!oldRoom) {
			sendEvent<string>(socket, ERROR_EVENT, "Room doesn't exist")

			return
		}

		if (oldRoom.name === roomName) {
			return
		}

		roomName = roomName.replace(/\s/g, "_")
		const newRoom = await getRoomByName(roomName)

		const room = await setPlayerRoomByName(player.id, roomName)
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
		broadcastToRoom<string>(SERVER_LOG_EVENT, `${player.username} has teleported from ${oldRoom.name}`, oldRoom.id)
		broadcastToRoom<Room>(ROOM_UPDATE_EVENT, room, room.id)
		broadcastToRoom<string>(SERVER_LOG_EVENT, `${player.username} has teleported into ${room.name}`, room.id)
		sendEvent<string>(socket, LOG_EVENT, message)
	} catch (error) {
		sendEvent<string>(socket, ERROR_EVENT, error.message)
		console.error(error)
	}
}

networkEmitter.on(TP_EVENT, handler)
