import {
  NetworkEventHandler,
  networkEmitter,
} from "./emitter"
import {
  sendEvent,
  broadcastToRoom,
} from "../"
import {
  DRAW_EVENT,
  ERROR_EVENT,
  SERVER_LOG_EVENT,
  NOTIFICATION_EVENT,
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
  BANNER_FILL,
  BANNER_WIDTH,
} from "../../../constants"

const handler: NetworkEventHandler = async (socket, payload: [number, number, string], player) => {
  try {
    const room = await getRoomById(player.roomId)

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
    let cost = 1    
    const replaceSymbol = room.banner.split("")[x + (BANNER_WIDTH*y)]
    if(replaceSymbol === BANNER_FILL || replaceSymbol === char)
      cost = 0
    if(player.golts < cost){
      sendEvent<string>(socket, ERROR_EVENT, `you need ${GOLT}${cost}`)

      return
    }
    await takePlayerGolts(player.id, cost)
    await editBaner(x, y, char, room)
    broadcastToRoom<string>(NOTIFICATION_EVENT, "pop", room.id);
  }catch(error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(DRAW_EVENT, handler)
