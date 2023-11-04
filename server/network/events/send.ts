import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  ERROR_EVENT,
  SEND_EVENT,
  SERVER_LOG_EVENT,
  NOTIFICATION_EVENT,
  INVENTORY_UPDATE_EVENT,
} from "../../../events"
import {
  sendEvent,
  broadcastToUser,
} from "../../network"
import {
  sendItem,
} from "../../services/item"
import {
  DELIVERY_COST,
  GOLT,
} from "../../../constants"
import {
  getPlayerByUsername,
  getInvByPlayer,
} from "../../services/player"
import {
  Item,
} from "../../../@types"

const handler: NetworkEventHandler = async (socket, args: string[], player) => {
  try {    
    const cost = DELIVERY_COST
    if(args[1] === player.username){
      sendEvent<string>(socket, SERVER_LOG_EVENT, "you can't send it to yourself, you already have it")

      return
    }
    if(player.golts >= cost){
      const user = await getPlayerByUsername(args[1])
      if(!user){
        sendEvent<string>(socket, ERROR_EVENT, `there is no user ${args[1]}`)

        return
      }
      await sendItem(player, args)
    }else{      
      sendEvent<string>(socket, SERVER_LOG_EVENT, `you need ${GOLT}${cost}`)

      return
    }

    sendEvent<string>(socket, SERVER_LOG_EVENT, `-${GOLT}${cost}`)
    broadcastToUser<string>(SERVER_LOG_EVENT, "you sent a " + args[0] + " to " + args[1], player.username); 
    broadcastToUser<string>(SERVER_LOG_EVENT, player.username + " sent a " + args[0] + " to you", args[1]); 
    broadcastToUser<string>(NOTIFICATION_EVENT, "sentmail", player.username); 
    broadcastToUser<string>(NOTIFICATION_EVENT, "gotmail", args[1]); 
    const inv = await getInvByPlayer(player.id)
    sendEvent<Item[]>(socket, INVENTORY_UPDATE_EVENT, inv)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}


networkEmitter.on(SEND_EVENT, handler)
