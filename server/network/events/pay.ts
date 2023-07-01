import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  PAY_EVENT,
  SERVER_LOG_EVENT,
  ERROR_EVENT,
  NOTIFICATION_EVENT,
  REFRESH_EVENT,
} from "../../../events"
import {
  online,
  sendEvent, 
} from "../"
import { 
  addPlayerGolts, 
  getPlayerById, 
  payPlayer,
} from "../../services/player"
import {
  getCurrentEvent,
  clearOldEvents,
  getUpcomingEvents,
  getCountdown,
  getDateString,
  moveZombies,
} from "../../services/event"
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
    const event = await getCurrentEvent(Date.now())
    if(event?.type === "Zombie_Invasion"){
      await moveZombies(event.id)
    }
    const list = online.map(o => o.player.username)
    if(list.includes(player.username)){
      
    }else{
      sendEvent<string>(socket, ERROR_EVENT, "a bug has occured, you are no longer online")
      sendEvent<string>(socket, REFRESH_EVENT, "oops")
    }
    const golts = player.golts
    if(!player.lastPaid){      
      await addPlayerGolts(player.id, 1)

      return
    }else{
      await payPlayer(player.id)
    }
    await clearOldEvents(Date.now())
    const newplayer = await getPlayerById(playerID)
    const newgolts = newplayer?.golts
    if(!newgolts){
      return
    }
    if(newgolts > golts){
      sendEvent<string>(socket, SERVER_LOG_EVENT, `you got ${GOLT}${newgolts - golts}`)
      sendEvent<string>(socket, NOTIFICATION_EVENT, "pay")
    }
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(PAY_EVENT, handler)
