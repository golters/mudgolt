import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  ERROR_EVENT,
  DROP_ITEM_EVENT,
  SERVER_LOG_EVENT,
  INVENTORY_UPDATE_EVENT,
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
    await dropItem(player, item)
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

    broadcastToRoom<string>(SERVER_LOG_EVENT, `${username} dropped ${item}`,player.roomId)
    await insertRoomCommand(player.roomId, player.id, `dropped ${item}`, Date.now(), "drop")
    const inv = await getInvByPlayer(player.id)
    sendEvent<Item[]>(socket, INVENTORY_UPDATE_EVENT, inv)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}


networkEmitter.on(DROP_ITEM_EVENT, handler)
