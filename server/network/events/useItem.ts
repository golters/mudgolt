import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  sendEvent,
} from ".."
import {
  USE_ITEM_EVENT,
  SERVER_LOG_EVENT,
  ERROR_EVENT,
  NOTIFICATION_EVENT,
} from "../../../events"
import {
  Player,
} from "../../../@types"
import {
  broadcastToRoom,
} from "../../network"
import {
  getRoomById,
} from "../../services/room"
import {
  insertRoomCommand,
} from "../../services/chat"
import{
  getItemByPlayer,
}from "../../services/item"

const handler: NetworkEventHandler = async (
  socket,
  item: string,
  player: Player,
) => {
  try {
    const room = await getRoomById(player.roomId)      
    const inv = await getItemByPlayer(player.id)
    let items = inv
    items = items.filter(i => i.name === item)
    if(items.length === 0){
      sendEvent<string>(socket, ERROR_EVENT, `you have no ${item}`)

      return
    }
    let message = items[0].macro
    if(message.length === 0){
      message = `uses ${item}`
    }
    broadcastToRoom<string>(SERVER_LOG_EVENT, player.username + " " + message, room.id);
    await insertRoomCommand(room.id, player.id, message, Date.now(), "me")
    broadcastToRoom<string>(NOTIFICATION_EVENT, "me", room.id);
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(USE_ITEM_EVENT, handler)
