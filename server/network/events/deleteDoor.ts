import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  ERROR_EVENT,
  SERVER_LOG_EVENT,
  DELETE_DOOR_EVENT,
} from "../../../events"
import {
  sendEvent,
} from "../../network"
import {
  createDoor,
  getDoorByName,
  deleteDoor,
} from "../../services/door"
import {
  getRoomByName,
} from "../../services/room"
import { Player } from "@types"

const handler: NetworkEventHandler = async (socket, args: string, player) => {
  try {
	  let [name] = args
	  const door = await getDoorByName(player?.roomId, name)
	  if (!door) {
		  throw new Error("There is no such door")
		  
      return
	  }

	  const roomID = player.roomId
	  name = name.replace(/\s/g, "_")
	  await deleteDoor(roomID, name)


	  sendEvent<string>(socket, SERVER_LOG_EVENT, `Deleted door ${name}`)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}


networkEmitter.on(DELETE_DOOR_EVENT, handler)
