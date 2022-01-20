import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  PAY_EVENT,
  SERVER_LOG_EVENT,
  ERROR_EVENT,
} from "../../../events"
import {
  sendEvent, 
} from "../"
import { 
  addPlayerGolts, 
  getPlayerById, 
  payPlayer,
} from "../../services/player"
import { GOLT } from "../../../constants"

const handler: NetworkEventHandler = async (socket, playerID: number) => {
  try {    
    const player = await getPlayerById(playerID)
    const lastpaid = player?.lastPaid
    if(!lastpaid){
      return
    }
    if(!player){
      sendEvent<string>(socket, ERROR_EVENT, "no player")

      return
    }
    const golts = player.golts
    if(!player.lastPaid){      
      await addPlayerGolts(player.id, 1)

      return
    }else{
      await payPlayer(player.id)
    }
    const newplayer = await getPlayerById(playerID)
    const newgolts = newplayer?.golts
    if(!newgolts){
      return
    }
    if(newgolts > golts){
      sendEvent<string>(socket, SERVER_LOG_EVENT, `you got ${GOLT}${newgolts - golts}`)
    }
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(PAY_EVENT, handler)
