import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  sendEvent,
} from ".."
import {
  ENCHANT_ITEM_EVENT, ERROR_EVENT, SERVER_LOG_EVENT,
} from "../../../events"
import {
  Player,
} from "../../../@types"
import {
  GOLT,
  ENCHANT_MAX,
} from "../../../constants"
import {
  getItemByPlayer, setItemMacro,
} from "../../services/item"
import { takePlayerGolts } from "../../services/player"
import { countCharacters } from "../../services/chat"

const handler: NetworkEventHandler = async (
  socket,
  args: string[],
  player: Player,
) => {
  try {
    const bioTemp = [...args];
    bioTemp.shift();
    const bio = bioTemp.join(" ");
    if(bio.length == 0){
      throw new Error("Please add an action")      
    }      
    let inventory = await getItemByPlayer(player.id);      
    inventory = inventory.filter(i => i.name === args[0])
    if(inventory.length > 0){
      if (bio.length > ENCHANT_MAX) {
        throw new Error(`Action must not be greater than ${ENCHANT_MAX} characters`)
      }
    
      const cost = await countCharacters(bio, inventory[0].description, ENCHANT_MAX)

      if (cost >= player.golts) {
        throw new Error(`you need ${GOLT}${cost}`)
      }

      await takePlayerGolts(player.id, cost)
      sendEvent<string>(socket, SERVER_LOG_EVENT, `-${GOLT}${cost}`)
      await setItemMacro(inventory[0].id, bio)
      sendEvent<string>(socket, SERVER_LOG_EVENT, `you edited ${args[0]}`)
    }else{
      sendEvent<string>(socket, ERROR_EVENT, `you don't have a ${args[0]}`)        
    }
    
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(ENCHANT_ITEM_EVENT, handler)
