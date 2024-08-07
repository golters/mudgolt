import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  ERROR_EVENT,
  SERVER_LOG_EVENT,
  DELETE_DOOR_EVENT,
} from "../../../events"
import {
  sendEvent,
  broadcastToRoom,
} from "../../network"
import {
  getDoorByName,
  deleteDoor,
  getDoorByRoom,
} from "../../services/door"
import {
  takePlayerGolts,
} from "../../services/player"
import {
  DELETE_DOOR_COST,
  GOLT,
} from "../../../constants"
import {
  getBearName,
  getCurrentEvent,
} from "../../services/event"

const handler: NetworkEventHandler = async (socket, args: string[], player) => {
  try {
    let name = args[0].replace(/\s/g, "_")
    const event = await getCurrentEvent(Date.now())
    if(event){
      switch (event.type){
        case "Bear_Week":
          const bearname = await getBearName(event.id, player.id)
          if(bearname){
            name = bearname
          }

          break;
      }
    }

    await getDoorByName(player.roomId, name)

    const roomID = player.roomId

    const doorCost = DELETE_DOOR_COST
    if(player.golts >= doorCost){
      await deleteDoor(roomID, name)
      await takePlayerGolts(player.id, doorCost)
      sendEvent<string>(socket, SERVER_LOG_EVENT, `-${GOLT}${doorCost}`)
      broadcastToRoom<string>(SERVER_LOG_EVENT, `${name} was deleted`, player.roomId)
    }else{
      sendEvent<string>(socket, SERVER_LOG_EVENT, `you need ${doorCost}`)
    }

    sendEvent<string>(socket, SERVER_LOG_EVENT, `Deleted door ${name}`)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(DELETE_DOOR_EVENT, handler)
