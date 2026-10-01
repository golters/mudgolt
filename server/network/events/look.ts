import {
  type NetworkEventHandler,
  networkEmitter,
} from "./emitter.ts"
import {
  sendEvent,
} from "../index.ts"
import {
  LOOK_EVENT,
  ERROR_EVENT,
  LOOK_LOG_EVENT,
} from "../../../events.ts"
import { getLookByID } from "../../services/room.ts"
import type { Look } from "../../../@types/index.ts"

const handler: NetworkEventHandler = async (socket, roomID: number, player) => {
  try {
    //const message = await lookByID(player.roomId)
    const look = await getLookByID(player.roomId)

    sendEvent<Look>(socket, LOOK_LOG_EVENT, look)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(LOOK_EVENT, handler)
