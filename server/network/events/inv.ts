import {
  type NetworkEventHandler,
  networkEmitter,
} from "./emitter.ts"
import {
  sendEvent,
} from "../index.ts"
import {
  INV_EVENT,
  LOG_EVENT,
  ERROR_EVENT,
} from "../../../events.ts"
import { getInvByPlayer } from "../../../server/services/player.ts"
import { GOLT } from "../../../constants.ts"

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
