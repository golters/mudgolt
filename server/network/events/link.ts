import {
  NetworkEventHandler,
  networkEmitter,
} from "./emitter"
import {
  sendEvent,
} from "../"
import {
  LINK_EVENT,
  LOG_EVENT,
  ERROR_EVENT,
} from "../../../events"
import {
  CommandModule, 
} from "../../../client/src/commands/emitter"
import{
  GOLT,
  DOOR_COST,
  DOOR_MULTIPLIER,
}from "../../../constants"
import{
  getDoorByRoom,
} from "../../services/door"
import { getRoomById } from "../../services/room"


const handler: NetworkEventHandler = async (socket, commands: CommandModule[], player) => {
  try {
    const room = await getRoomById(player.roomId)
    sendEvent<string>(socket, LOG_EVENT, "https://mudgolt.com/?go="+room.name)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(LINK_EVENT, handler)
