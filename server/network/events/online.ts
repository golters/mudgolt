import {
  NetworkEventHandler,
  networkEmitter,
} from "./emitter"
import {
  online,
  sendEvent,
} from "../"
import {
  ONLINE_EVENT,
  LOG_EVENT,
  ERROR_EVENT,
} from "../../../events"
import {
  getRecentlyOnline,
} from "../../services/player"

const handler: NetworkEventHandler = async (socket, roomID: string, player) => {
  try {

    let message = "Online ("+ online.length + "):\n"

    online.forEach(({ player }) => {
      message = `${message} ${player.username}\n`
    })

    const onlinenames = online.map(x => x.player.username)
    const recent = await getRecentlyOnline()
    let recentAmount = 0
    
    recent.forEach((player) => {
      if(!onlinenames.includes(player.username))
        recentAmount++
    })
    if(recentAmount > 0){
      message = message + "Recently online ("+ recentAmount +"):\n"
      recent.forEach((player) => {
        if(!onlinenames.includes(player.username))
          message = `${message} ${player.username}\n`
      })
    }

    sendEvent<string>(socket, LOG_EVENT, message)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(ONLINE_EVENT, handler)
