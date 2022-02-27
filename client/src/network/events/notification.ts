import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  NOTIFICATION_EVENT, 
} from "../../../../events"
import {
  iconUtil,
} from "../../utils/icon"
import {
  store,
} from "../../store"
import whisper from "../../assets/sfx/whisper.mp3"
import shout from "../../assets/sfx/shout.mp3"
import doorEnter from "../../assets/sfx/doorEnter.mp3"
import doorExit from "../../assets/sfx/doorExit.mp3"
import teleportEnter from "../../assets/sfx/teleportEnter.mp3"
import teleportExit from "../../assets/sfx/teleportExit.mp3"
import online from "../../assets/sfx/online.mp3"
import offline from "../../assets/sfx/offline.mp3"
import coin from "../../assets/sfx/coin.mp3"
import {
  pushToLog,
} from "../../components/Terminal"

const sfx = {
  whisper: new Audio(whisper),
  shout: new Audio(shout),
  doorEnter: new Audio(doorEnter),
  doorExit: new Audio(doorExit),
  teleportEnter: new Audio(teleportEnter),
  teleportExit: new Audio(teleportExit),
  online: new Audio(online),
  offline: new Audio(offline),
  pay: new Audio(coin),
}

const handler: NetworkEventHandler = (sound: keyof typeof sfx) => {
  if(!store.notifications){
    store.notifications = 0
  }
  if(document.hidden){ 
    store.notifications = store.notifications + 1
  
    document.title = `(${store.notifications}) MUDGOLT`
  }
  iconUtil.changeFavicon(iconUtil.getFaviconUrl(store.notifications))
  if (sfx[sound] === undefined) {
    console.error("invalid sfx", sound)

    return
  }
  if(!localStorage.getItem("muted")){
    sfx[sound].currentTime = 0
    sfx[sound].play()
  }
}

networkEmitter.on(NOTIFICATION_EVENT, handler)
