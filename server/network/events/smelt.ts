import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  ERROR_EVENT,
  SMELT_ITEM_EVENT,
  SERVER_LOG_EVENT,
  NOTIFICATION_EVENT,
  INVENTORY_UPDATE_EVENT,
} from "../../../events"
import {
  sendEvent,
} from "../../network"
import {
  smeltItem, createItem,
} from "../../services/item"
import { SMELT_COST, GOLT } from "../../../constants"
import {
  getInvByPlayer,
} from "../../services/player"
import {
  Item,
} from "../../../@types"

const handler: NetworkEventHandler = async (socket, args: string, player) => {
  try {    
    const cost = SMELT_COST
    let ingot = 0
    if(player.golts >= cost){
      ingot = await smeltItem(player, args)
    }else{      
      sendEvent<string>(socket, SERVER_LOG_EVENT, `you need ${GOLT}${cost}`)

      return
    }
    const rand = Math.random() * 50
    //small chance per char multiplied by item age
    if(rand + ingot > 75){
      await createItem(player.id, "golt_crystal")
      sendEvent<string>(socket, SERVER_LOG_EVENT, "you found a golt_crystal")  
      sendEvent<string>(socket, NOTIFICATION_EVENT, "pay")
    } 
    sendEvent<string>(socket, SERVER_LOG_EVENT, `you recovered ${GOLT}${ingot}`)    
    sendEvent<string>(socket, NOTIFICATION_EVENT, "smelt")
    const inv = await getInvByPlayer(player.id)
    sendEvent<Item[]>(socket, INVENTORY_UPDATE_EVENT, inv)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}


networkEmitter.on(SMELT_ITEM_EVENT, handler)
