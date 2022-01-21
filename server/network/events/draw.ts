import {
  NetworkEventHandler,
  networkEmitter,
} from "./emitter"
import {
  sendEvent,
} from "../"
import {
  DRAW_EVENT,
  ERROR_EVENT,
  SERVER_LOG_EVENT,
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

const handler: NetworkEventHandler = async (socket, payload: [number, number, string], player) => {
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

    if (char.length !== 1) {
      sendEvent<string>(socket, ERROR_EVENT, "You may only draw one character at a time")

      return
    }
    
    const cost = 1
    
    if(player.golts <= 0){
      sendEvent<string>(socket, ERROR_EVENT, `you need ${GOLT}${cost}`)

      return
    }
    await takePlayerGolts(player.id, cost)
    await editBaner(x, y, char, room)
  }catch(error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(DRAW_EVENT, handler)
