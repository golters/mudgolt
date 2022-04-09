import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  ERROR_EVENT,
  PAY_USER_EVENT,
  SERVER_LOG_EVENT,
  NOTIFICATION_EVENT,
} from "../../../events"
import {
  sendEvent,
  broadcastToUser,
} from "../../network"
import {
} from "../../services/item"
import {
  GOLT,
} from "../../../constants"
import {
  getPlayerByUsername,
  addPlayerGolts,
  takePlayerGolts,
} from "../../services/player"
import { userInfo } from "os"

const handler: NetworkEventHandler = async (socket, args: string[], player) => {
  try {    
    const cost = Number(args[1])
    if(cost <= 0){
      sendEvent<string>(socket, SERVER_LOG_EVENT, "send a positive value")

      return
    }
    if(args[0] === player.username){
      sendEvent<string>(socket, SERVER_LOG_EVENT, "you can't send it to yourself, you already have it")

      return
    }
    if(player.golts >= cost){
      const user = await getPlayerByUsername(args[0])
      if(!user){
        sendEvent<string>(socket, ERROR_EVENT, `there is no user ${args[0]}`)

        return
      }
      await addPlayerGolts(user.id, cost)
      await takePlayerGolts(player.id, cost)
    }else{      
      sendEvent<string>(socket, SERVER_LOG_EVENT, `you need ${GOLT}${cost}`)

      return
    }

    sendEvent<string>(socket, SERVER_LOG_EVENT, `-${GOLT}${cost}`)
    broadcastToUser<string>(SERVER_LOG_EVENT, "you sent " + GOLT + cost + " to " + args[0], player.username); 
    broadcastToUser<string>(SERVER_LOG_EVENT, player.username + " sent " + GOLT + cost + " to you", args[0]); 
    broadcastToUser<string>(NOTIFICATION_EVENT, "pay", player.username); 
    broadcastToUser<string>(NOTIFICATION_EVENT, "pay", args[0]); 
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}


networkEmitter.on(PAY_USER_EVENT, handler)
