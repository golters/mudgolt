import {
  type NetworkEventHandler,
  networkEmitter,
} from "./emitter.ts"
import {
  sendEvent,
} from "../index.ts"
import {
  LINK_EVENT,
  LOG_EVENT,
  ERROR_EVENT,
} from "../../../events.ts"
import type {
  CommandModule, 
} from "../../../client/src/commands/emitter.ts"
import { getRoomById } from "../../services/room.ts"


const handler: NetworkEventHandler = async (socket, commands: CommandModule[], player) => {
  try {
    const room = await getRoomById(player.roomId)
    sendEvent<string>(socket, LOG_EVENT, "https://mudgolt.com/?go="+room.name)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(LINK_EVENT, handler)
