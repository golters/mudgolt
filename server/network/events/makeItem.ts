import {
  networkEmitter, type NetworkEventHandler,
} from "./emitter.ts"
import {
  ERROR_EVENT,
  INVENTORY_UPDATE_EVENT,
  MAKE_ITEM_EVENT,
  SERVER_LOG_EVENT,
} from "../../../events.ts"
import {
  sendEvent,
} from "../../network/index.ts"
import {
  createItem,
} from "../../services/item.ts"
import { ITEM_COST, GOLT, ITEM_MAX_NAME } from "../../../constants.ts"
import {
  takePlayerGolts,
  getInvByPlayer,
} from "../../services/player.ts"
import type {
  Item,
} from "../../../@types/index.ts"

const handler: NetworkEventHandler = async (socket, args: string, player) => {
  try {    
    const name = args.replace(/\s/g, "_")
    const cost = name.length + ITEM_COST
    if(name.length > ITEM_MAX_NAME){
      sendEvent<string>(socket, ERROR_EVENT, `max length is ${ITEM_MAX_NAME} characters`)
      
      return
    }
    if(player.golts <= cost){
      sendEvent<string>(socket, SERVER_LOG_EVENT, `you need ${GOLT}${cost}`)

      return
    }
    await createItem(player.id, args) 
    await takePlayerGolts(player.id, cost)
    sendEvent<string>(socket, SERVER_LOG_EVENT, `-${GOLT}${cost}`)
    sendEvent<string>(socket, SERVER_LOG_EVENT, `${player.username} Created a ${args}`)
    const inv = await getInvByPlayer(player.id)
    sendEvent<Item[]>(socket, INVENTORY_UPDATE_EVENT, inv)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}


networkEmitter.on(MAKE_ITEM_EVENT, handler)
