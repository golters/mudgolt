import {
  NetworkEventHandler,
  networkEmitter,
} from "./emitter"
import {
  sendEvent,
  broadcastToRoom,
} from "../"
import {
  DRAW_COLOR_EVENT,
  DRAW_BACK_COLOR_EVENT,
  ERROR_EVENT,
  SERVER_LOG_EVENT,
  NOTIFICATION_EVENT,
  DRAW_EVENT,
} from "../../../events"
import {
  getRoomById,
  editBaner,
  editBanerCol,
  editBanerBackCol,
} from "../../services/room"
import {
  takePlayerGolts,
} from "../../services/player"
import {
  GOLT,
  BANNER_FILL,
  BANNER_WIDTH,
} from "../../../constants"

const handler1: NetworkEventHandler = async (socket, payload: [number, number, string], player) => {
  try {
    const room = await getRoomById(player.roomId)

    if (!Array.isArray(payload)) {
      sendEvent<string>(socket, ERROR_EVENT, "Payload isn't an array")

      return
    }

    const [x, y, char] = payload

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
    //await takePlayerGolts(player.id, cost)
    await editBanerCol(x, y, char, room)
    //broadcastToRoom<string>(NOTIFICATION_EVENT, "pop", room.id);
  }catch(error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

const handler2: NetworkEventHandler = async (socket, payload: [number, number, string], player) => {
  try {
    const room = await getRoomById(player.roomId)

    if (!Array.isArray(payload)) {
      sendEvent<string>(socket, ERROR_EVENT, "Payload isn't an array")

      return
    }

    const [x, y, char] = payload

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
    //await takePlayerGolts(player.id, cost)
    await editBanerBackCol(x, y, char, room)
    //broadcastToRoom<string>(NOTIFICATION_EVENT, "pop", room.id);
  }catch(error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(DRAW_COLOR_EVENT, handler1)

networkEmitter.on(DRAW_BACK_COLOR_EVENT, handler2)
