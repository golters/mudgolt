import {
  type NetworkEventHandler,
  networkEmitter,
} from "./emitter.ts"
import {
  sendEvent,
  broadcastToRoom,
} from "../index.ts"
import {
  DRAW_COLOR_EVENT,
  DRAW_BACK_COLOR_EVENT,
  ERROR_EVENT,
  SERVER_LOG_EVENT,
  NOTIFICATION_EVENT,
  DRAW_EVENT,
} from "../../../events.ts"
import {
  getRoomById,
  editBaner,
  editBanerCol,
} from "../../services/room.ts"
import {
  takePlayerGolts,
} from "../../services/player.ts"
import {
  GOLT,
  BANNER_FILL,
  BANNER_WIDTH,
} from "../../../constants.ts"

const handler: NetworkEventHandler = async (socket, payload: [number, number, string, string], player) => {
  try {
    const room = await getRoomById(player.roomId)

    if (!Array.isArray(payload)) {
      sendEvent<string>(socket, ERROR_EVENT, "Payload isn't an array")

      return
    }

    const [x, y, prime, back] = payload

    if (typeof x !== "number" || typeof y !== "number" || typeof prime !== "string" || typeof back !== "string") {
      sendEvent<string>(socket, ERROR_EVENT, "Invalid payload")

      return
    }
    let cost = 1    
    if(room.primeColor && room.backColor){
      const replaceColor = room.primeColor.split("")[x + (BANNER_WIDTH*y)]
      const replaceBack= room.backColor.split("")[x + (BANNER_WIDTH*y)]
      if(replaceColor === prime && replaceBack === back)
        cost = 0
    }
    if(player.golts < cost){
      sendEvent<string>(socket, ERROR_EVENT, `you need ${GOLT}${cost}`)

      return
    }
    await takePlayerGolts(player.id, cost)
    await editBanerCol(x, y, prime, back, room)
    broadcastToRoom<string>(NOTIFICATION_EVENT, "pop", room.id);
  }catch(error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(DRAW_COLOR_EVENT, handler)
