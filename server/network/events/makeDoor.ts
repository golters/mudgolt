import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  ERROR_EVENT,
  MAKE_DOOR_EVENT,
  SERVER_LOG_EVENT,
} from "../../../events"
import {
  broadcastToRoom,
  sendEvent,
} from "../../network"
import {
  createDoor,
  getDoorByRoom,
} from "../../services/door"
import {
  getRoomByName,
} from "../../services/room"
import {
  takePlayerGolts,
} from "../../services/player"
import {
  DOOR_COST,
  DOOR_MULTIPLIER,
  GOLT,
  DOOR_MAX_NAME,
} from "../../../constants"

const handler: NetworkEventHandler = async (socket, args: string, player) => {
  try {
    const [nameInput, target] = args

    const targetRoom = await getRoomByName(target)
    const roomID = player.roomId
    const targetID = targetRoom.id

    const name = nameInput.replace(/\s/g, "_")
    const doors = await getDoorByRoom(roomID)
    const cost = DOOR_COST + (DOOR_COST * DOOR_MULTIPLIER * doors.length) + name.length
    if(name.length > DOOR_MAX_NAME){
      sendEvent<string>(socket, ERROR_EVENT, `max length is ${DOOR_MAX_NAME} characters`)

      return
    }
    if(player.golts <= cost){
      sendEvent<string>(socket, SERVER_LOG_EVENT, `you need ${GOLT}${cost}`)

      return
    }
    await createDoor(roomID, targetID, name)
    await takePlayerGolts(player.id, cost)
    sendEvent<string>(socket, SERVER_LOG_EVENT, `-${GOLT}${cost}`)
    broadcastToRoom<string>(SERVER_LOG_EVENT, `Created door ${name} to ${target}`, player.roomId)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}


networkEmitter.on(MAKE_DOOR_EVENT, handler)
