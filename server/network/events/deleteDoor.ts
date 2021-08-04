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
  getDoorByName,
  deleteDoor,
} from "../../services/door"

const handler: NetworkEventHandler = async (socket, args: string[], player) => {
  try {
    const name = args[0].replace(/\s/g, "_")

    await getDoorByName(player.roomId, name)

    const roomID = player.roomId

    await deleteDoor(roomID, name)

    sendEvent<string>(socket, SERVER_LOG_EVENT, `Deleted door ${name}`)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(DELETE_DOOR_EVENT, handler)
