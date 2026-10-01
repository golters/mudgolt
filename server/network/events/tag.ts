import {
  networkEmitter, type NetworkEventHandler,
} from "./emitter.ts"
import {
  sendEvent,
  broadcastToRoom,
} from "../index.ts"
import {
  ERROR_EVENT, INVENTORY_UPDATE_EVENT, SERVER_LOG_EVENT, TAG_ITEM_EVENT,
} from "../../../events.ts"
import type {
  Player,
  Item,
} from "../../../@types/index.ts"
import {
  ITEM_MAX_TAGS,
} from "../../../constants.ts"
import {
  getItemByPlayer, setItemBio, setItemTags,
} from "../../services/item.ts"

const handler: NetworkEventHandler = async (
  socket,
  args: string[],
  player: Player,
) => {
  try {
    const bioTemp = [...args];
    bioTemp.shift();
    const bio = bioTemp.join(" ");
    const fullinventory = await getItemByPlayer(player.id);   
    let inventory = fullinventory   
    inventory = inventory.filter(i => i.name === args[0])
    if(inventory.length > 0){
      if (bio.length > ITEM_MAX_TAGS) {
        throw new Error(`Tags must not be greater than ${ITEM_MAX_TAGS} characters`)
      }

      await setItemTags(inventory[0].id, bio)
      sendEvent<string>(socket, SERVER_LOG_EVENT, `you tagged ${args[0]}`)
    }
    
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(TAG_ITEM_EVENT, handler)
