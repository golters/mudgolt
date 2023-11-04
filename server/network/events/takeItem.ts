import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  ERROR_EVENT,
  TAKE_ITEM_EVENT,
  SERVER_LOG_EVENT,
  INVENTORY_UPDATE_EVENT,
} from "../../../events"
import {
  sendEvent,
  broadcastToRoom,
} from "../../network"
import {
  takeItem,
} from "../../services/item"
import {
  insertRoomCommand,
} from "../../services/chat"
import {
  getCurrentEvent,
  getBearName,
} from "../../services/event"
import {
  getInvByPlayer,
} from "../../services/player"
import {
  Item,
} from "../../../@types"

const handler: NetworkEventHandler = async (socket, item: string, player) => {
  try {    
    await takeItem(player, item)
    let username = player.username
    const event = await getCurrentEvent(Date.now())    
    if(event){
      switch (event.type){
        case "Bear_Week":
          const bearname = await getBearName(event.id, player.id)
          if(bearname){
            username = bearname
          }

          break;
      }
    }

    broadcastToRoom<string>(SERVER_LOG_EVENT, `${username} took ${item}`,player.roomId)
    await insertRoomCommand(player.roomId, player.id, `took ${item}`, Date.now(), "take")
    const inv = await getInvByPlayer(player.id)
    sendEvent<Item[]>(socket, INVENTORY_UPDATE_EVENT, inv)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}


networkEmitter.on(TAKE_ITEM_EVENT, handler)
