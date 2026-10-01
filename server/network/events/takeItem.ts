import {
  networkEmitter, type NetworkEventHandler,
} from "./emitter.ts"
import {
  ERROR_EVENT,
  TAKE_ITEM_EVENT,
  SERVER_LOG_EVENT,
  INVENTORY_UPDATE_EVENT,
} from "../../../events.ts"
import {
  sendEvent,
  broadcastToRoom,
} from "../../network/index.ts"
import {
  takeItem,
} from "../../services/item.ts"
import {
  insertRoomCommand,
} from "../../services/chat.ts"
import {
  getCurrentEvent,
  getBearName,
} from "../../services/event.ts"
import {
  getInvByPlayer,
} from "../../services/player.ts"
import type {
  Item,
} from "../../../@types/index.ts"

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
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}


networkEmitter.on(TAKE_ITEM_EVENT, handler)
