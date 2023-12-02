import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  ERROR_EVENT,
  MAKE_ROOM_EVENT, SERVER_LOG_EVENT,
} from "../../../events"
import {
  sendEvent, 
} from "../../network"
import {
  createRoom, 
} from "../../services/room"
import {
  ROOM_COST,
  GOLT,
  ROOM_MAX_NAME,
} from "../../../constants"
import {
  takePlayerGolts,
} from "../../services/player"

const handler: NetworkEventHandler = async (socket, name: string, player) => {
  try {
    if (name.length > ROOM_MAX_NAME) throw new Error(`Room name must not be greater than ${ROOM_MAX_NAME} characters`)

    const cost = name.length + ROOM_COST
    name = name.replace(/\s/g, "_")
    if(player.golts <= cost){
      sendEvent<string>(socket, SERVER_LOG_EVENT, `you need ${GOLT}${cost}`)

      return
    }
    await takePlayerGolts(player.id, cost)
    sendEvent<string>(socket, SERVER_LOG_EVENT, `-${GOLT}${cost}`)
    await createRoom(name)  
    sendEvent<string>(socket, SERVER_LOG_EVENT, `Created room ${name}`)
    
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}


networkEmitter.on(MAKE_ROOM_EVENT, handler)
