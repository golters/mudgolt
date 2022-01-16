import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  sendEvent,
  broadcastToRoom,
} from ".."
import {
  ROOM_DESCRIBE_EVENT, ERROR_EVENT, SERVER_LOG_EVENT,
} from "../../../events"
import {
  Player,
} from "../../../@types"
import {
  ROOM_MAX_BIO,
} from "../../../constants"
import {
  getRoomById,
  editBio,
} from "../../services/room"
import {
  getItemByPlayer, setItemBio,
} from "../../services/item"
import { setPlayerBio } from "../../services/player"

const handler: NetworkEventHandler = async (
  socket,
  args: string[],
  player: Player,
) => {
  try {
    const bioTemp = [...args];
    bioTemp.shift();
    const bio = bioTemp.join(" ");
    if(args[0] === "me" || args[0] === "myself" || args[0] === "self"){
      await setPlayerBio(player.id, bio)
      broadcastToRoom<string>(SERVER_LOG_EVENT, `${player.username} changed apperance`,player.roomId)
    }else if(args[0] === "room"){

      const room = await getRoomById(player.roomId)
      const oldBio = room?.description

      if (bio.length > ROOM_MAX_BIO) {
        throw new Error(`Description must not be greater than ${ROOM_MAX_BIO} characters`)
      }

      if (oldBio === undefined) {
        return
      }

      const checked = new Array<number>()

      for (let i = 0; i < bio.length; i++) {
        for (let b = 0; b < oldBio?.length; b++) {
          if (!checked.includes(b)) {
            if (i <= oldBio?.length && i <= bio.length) {
              if (bio.charAt(i) === oldBio.charAt(b)) {
                checked.push(b)
                console.log(oldBio.charAt(b) + " " + b)
                break
              }
            }
          }
        }
      }

      const remainder = bio.length > oldBio?.length 
        ? (ROOM_MAX_BIO - oldBio?.length) - (ROOM_MAX_BIO - bio?.length)
        : 0

      const cost = (oldBio?.length - checked.length) + remainder

      if (cost > 50) {
        throw new Error("This edit is too much, try to change/add under 50 characters at a time")
      }

      await editBio(bio, room)
      broadcastToRoom<string>(SERVER_LOG_EVENT, `${player.username} edited room description`,player.roomId)
    }else{      
      let inventory = await getItemByPlayer(player.id);      
      inventory = inventory.filter(i => i.name === args[0])
      if(inventory.length > 0){
        await setItemBio(inventory[0].id, bio)
        sendEvent<string>(socket, SERVER_LOG_EVENT, `you edited ${args[0]}`)
      }else{
        sendEvent<string>(socket, ERROR_EVENT, `you don't have a ${args[0]}. please write: describe me/room/or the name of an item in your inventory`)        
      }
    }
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(ROOM_DESCRIBE_EVENT, handler)
