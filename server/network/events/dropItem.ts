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
import {
  insertRoomCommand,
} from "../../services/chat"

const handler: NetworkEventHandler = async (socket, item: string, player) => {
  try {    
    await dropItem(player, item)

    broadcastToRoom<string>(SERVER_LOG_EVENT, `${player.username} dropped ${item}`,player.roomId)
    await insertRoomCommand(player.roomId, player.id, `${player.username} dropped ${item}`, Date.now(), "drop")
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}


networkEmitter.on(DROP_ITEM_EVENT, handler)
