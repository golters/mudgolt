import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  ERROR_EVENT,
  DROP_ITEM_EVENT,
  SERVER_LOG_EVENT,
} from "../../../events"
import {
  sendEvent,
  broadcastToRoom,
} from "../../network"
import {
  dropItem,
} from "../../services/item"

const handler: NetworkEventHandler = async (socket, item: string, player) => {
  try {    
    await dropItem(player, item)

    broadcastToRoom<string>(SERVER_LOG_EVENT, `${player.username} dropped ${item}`,player.roomId)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}


networkEmitter.on(DROP_ITEM_EVENT, handler)
