import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  ERROR_EVENT,
  TAKE_ITEM_EVENT,
  SERVER_LOG_EVENT,
} from "../../../events"
import {
  sendEvent,
  broadcastToRoom,
} from "../../network"
import {
  takeItem,
} from "../../services/item"

const handler: NetworkEventHandler = async (socket, item: string, player) => {
  try {    
    await takeItem(player, item)

    broadcastToRoom<string>(SERVER_LOG_EVENT, `${player.username} took ${item}`,player.roomId)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}


networkEmitter.on(TAKE_ITEM_EVENT, handler)
