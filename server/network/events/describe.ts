import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  sendEvent,
  broadcastToRoom,
} from ".."
import {
  ROOM_DESCRIBE_EVENT, ERROR_EVENT, SERVER_LOG_EVENT, INVENTORY_UPDATE_EVENT,
} from "../../../events"
import {
  Player,
  Item,
} from "../../../@types"
import {
  GOLT,
  ROOM_MAX_BIO,
  PLAYER_MAX_BIO,
  ITEM_MAX_BIO,
} from "../../../constants"
import {
  getRoomById,
  editBio,
} from "../../services/room"
import {
  getItemByPlayer, setItemBio,
} from "../../services/item"
import { setPlayerBio,takePlayerGolts } from "../../services/player"
import { countCharacters } from "../../services/chat"
import {
  getBearName,
  getCurrentEvent,
} from "../../services/event"

const handler: NetworkEventHandler = async (
  socket,
  args: string[],
  player: Player,
) => {
  try {
    let name = player.username
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
    const bioTemp = [...args];
    bioTemp.shift();
    const bio = bioTemp.join(" ");
    if(bio.length == 0){
      throw new Error("Please add a description")      
    }
    if(args[0] === "me" || args[0] === "myself" || args[0] === "self"){
      if(event?.type === "Bear_Week"){
        sendEvent<string>(socket, SERVER_LOG_EVENT, "you are stuck as a bear and cannot change")        
      }else{
        if (bio.length > PLAYER_MAX_BIO) {
          throw new Error(`Description must not be greater than ${PLAYER_MAX_BIO} characters`)
        }
        
        const cost = await countCharacters(bio, player.description, PLAYER_MAX_BIO)
  
        if (cost >= player.golts) {
          throw new Error(`you need ${GOLT}${cost}`)
        }
  
        await takePlayerGolts(player.id, cost)
        sendEvent<string>(socket, SERVER_LOG_EVENT, `-${GOLT}${cost}`)
        await setPlayerBio(player.id, bio)
        broadcastToRoom<string>(SERVER_LOG_EVENT, `${player.username} changed apperance`,player.roomId)
      }
    }else if(args[0] === "room"){

      const room = await getRoomById(player.roomId)
      const oldBio = room?.description

      if (bio.length > ROOM_MAX_BIO) {
        throw new Error(`Description must not be greater than ${ROOM_MAX_BIO} characters`)
      }

      if (oldBio === undefined) {
        return
      }

      const cost = await countCharacters(bio, oldBio, ROOM_MAX_BIO)

      if (cost >= player.golts) {
        throw new Error(`you need ${GOLT}${cost}`)
      }
      
      await takePlayerGolts(player.id, cost)
      sendEvent<string>(socket, SERVER_LOG_EVENT, `-${GOLT}${cost}`)
      await editBio(bio, room)
      broadcastToRoom<string>(SERVER_LOG_EVENT, `${name} edited room description`,player.roomId)
    }else{      
      const fullinventory = await getItemByPlayer(player.id);   
      let inventory = fullinventory     
      inventory = inventory.filter(i => i.name === args[0])
      if(inventory.length > 0){
        if (bio.length > ITEM_MAX_BIO) {
          throw new Error(`Description must not be greater than ${ITEM_MAX_BIO} characters`)
        }
      
        const cost = await countCharacters(bio, inventory[0].description, ITEM_MAX_BIO)

        if (cost >= player.golts) {
          throw new Error(`you need ${GOLT}${cost}`)
        }

        await takePlayerGolts(player.id, cost)
        sendEvent<string>(socket, SERVER_LOG_EVENT, `-${GOLT}${cost}`)
        await setItemBio(inventory[0].id, bio)
        sendEvent<string>(socket, SERVER_LOG_EVENT, `you edited ${args[0]}`)
      }else{
        sendEvent<string>(socket, ERROR_EVENT, `you don't have a ${args[0]}. please write: describe me/room/or the name of an item in your inventory`)
      }
    }
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(ROOM_DESCRIBE_EVENT, handler)
