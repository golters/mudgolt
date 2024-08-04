import {
  NetworkEventHandler,
  networkEmitter,
} from "./emitter"
import {
  sendEvent,
} from "../"
import {
  INV_EVENT,
  LOG_EVENT,
  ERROR_EVENT,
} from "../../../events"
import { getInvByPlayer } from "../../../server/services/player"
import { GOLT } from "../../../constants"

const handler: NetworkEventHandler = async (socket, roomID: number, player) => {
  try {
    const items = await getInvByPlayer(player.id)
    const names = items.map(x => x.name);
    let message = `you have ${GOLT}${player.golts}`
    if(items.length > 0){
      message = message + ` and a ${names}`
    }
    sendEvent<string>(socket, LOG_EVENT, message)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(INV_EVENT, handler)
