import {
  NetworkEventHandler,
  networkEmitter,
} from "./emitter"
import {
  sendEvent,
} from "../"
import {
  LOOK_AT_EVENT,
  LOG_EVENT,
  ERROR_EVENT,
} from "../../../events"
import {
  getPlayerByRoom,
} from "../../services/player"
import {
  getItemByPlayer,
  getItemByRoom,
} from "../../services/item"
import {
  getCurrentEvent,
  getEventTag,
} from "../../services/event"

const handler: NetworkEventHandler = async (socket, args: string[], player) => {
  try {
    const event = await getCurrentEvent(Date.now())
    let players = await getPlayerByRoom(player.roomId);
    let items = await getItemByRoom(player.roomId);
    let inventory = await getItemByPlayer(player.id);
    players.forEach(player => {
      if(!args.includes(player.username)){
        players = players.filter(p => p !== player)
      }
    });
    items.forEach(item => {
      if(!args.includes(item.name)){
        items = items.filter(i => i !== item)
      }
    });
    inventory.forEach(item => {
      if(!args.includes(item.name)){
        inventory = inventory.filter(i => i !== item)
      }
    });
    if(players.length > 0){
      let playerDesc = players[0].description
      if(event){
        if(event.type === "Zombie_Invasion"){
          const tag = await getEventTag(players[0].id, "player", event.id)
          if(tag){
            playerDesc = "A ghoulish zombie. " + playerDesc
          }
        }
      }
      sendEvent<string>(socket, LOG_EVENT, playerDesc)
    }else if (items.length > 0){
      sendEvent<string>(socket, LOG_EVENT, `${items[0].description}`)
    }else if (inventory.length > 0){
      sendEvent<string>(socket, LOG_EVENT, `${inventory[0].description}`)
    }else{
      sendEvent<string>(socket, LOG_EVENT, "use the name of a user or item")
    }
    
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(LOOK_AT_EVENT, handler)
