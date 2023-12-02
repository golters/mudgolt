import {
  NetworkEventHandler,
  networkEmitter,
} from "./emitter"
import {
  sendEvent,
  broadcastToRoom,
  broadcastToUser,
  broadcast,
} from "../"
import {
  DRAW_AVATAR_EVENT,
  ERROR_EVENT,
  SERVER_LOG_EVENT,
  NOTIFICATION_EVENT,
  TOOLBAR_UPDATE_EVENT,
  NPC_UPDATE_EVENT,
} from "../../../events"
import {
  getRoomById,
  editBaner,
} from "../../services/room"
import {
  takePlayerGolts,
} from "../../services/player"
import {
  GOLT,
} from "../../../constants"
import { Npc } from "../../../@types"
import { editAvatar, getLivingNpcs } from "../../services/npc"

const handler: NetworkEventHandler = async (socket, payload: [number, number, string, Npc], player) => {
  try {
    if(!payload){
      sendEvent<string>(socket, ERROR_EVENT, "no npc")

      return
    }
    let icon = ""
    if(!payload[3]){
      sendEvent<string>(socket, ERROR_EVENT, "no npc")

      return
    }else{
      icon = payload[3].icon
    }


    if (!Array.isArray(payload)) {
      sendEvent<string>(socket, ERROR_EVENT, "Payload isn't an array")

      return
    }

    const [x, y, char] = payload
    if(char){
      const regex = /\p{RI}\p{RI}|\p{Emoji}(\p{EMod}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?(\u{200D}\p{Emoji}(\p{EMod}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?)*|./gus
      const test = char.split(regex)
      if(test.length !== 5){
        sendEvent<string>(socket, ERROR_EVENT, "You may only draw one character at a time")

        return
      }      
    }

    if (typeof x !== "number" || typeof y !== "number" || typeof char !== "string") {
      sendEvent<string>(socket, ERROR_EVENT, "Invalid payload")

      return
    }
    
    const cost = 1
    
    if(player.golts <= 0){
      sendEvent<string>(socket, ERROR_EVENT, `you need ${GOLT}${cost}`)

      return
    }
    await takePlayerGolts(player.id, cost)
    await editAvatar(x, y, char, payload[3])
    broadcastToUser<string>(NOTIFICATION_EVENT, "pop", player.username);
    const npcs = await getLivingNpcs()    
    broadcast(NPC_UPDATE_EVENT, npcs)
    //update all toolbars?
  }catch(error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(DRAW_AVATAR_EVENT, handler)
