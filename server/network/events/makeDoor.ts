import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  ERROR_EVENT,
  MAKE_DOOR_EVENT,
  SERVER_LOG_EVENT,
} from "../../../events"
import {
  sendEvent,
} from "../../network"
import {
  createDoor,
} from "../../services/door"
import {
  getRoomByName,
} from "../../services/room"

const handler: NetworkEventHandler = async (socket, args: string, player) => {
  try {
    const [nameInput, target] = args

    const targetRoom = await getRoomByName(target)
    const roomID = player.roomId
    const targetID = targetRoom.id

    const name = nameInput.replace(/\s/g, "_")
    
    await createDoor(roomID, targetID, name)

    sendEvent<string>(socket, SERVER_LOG_EVENT, `Created door ${name} to ${target}`)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}


networkEmitter.on(MAKE_DOOR_EVENT, handler)
