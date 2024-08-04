import {
  NetworkEventHandler,
  networkEmitter,
} from "./emitter"
import {
  sendEvent,
} from "../"
import {
  LOG_EVENT,
  ERROR_EVENT,
  INSIGHT_EVENT,
} from "../../../events"
import {
  getPlayerById,
  getPlayerByRoom,
} from "../../services/player"
import {
  getItemByPlayer,
  getItemByRoom,
} from "../../services/item"

const handler: NetworkEventHandler = async (socket, args: string[], player) => {
  try {
    let items = await getItemByRoom(player.roomId);
    let inventory = await getItemByPlayer(player.id);
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
    if (items.length > 0){
      let creator = ""
      if(items[0].creator){
        const player = await getPlayerById(Number(items[0].creator))
        creator = `This ${items[0].name} was created by ${player?.username}.`
      }else{
        creator = `A ${items[0].name}.`
      }
      let date = ""
      if(items[0].date){
        date = `It was made on ${new Date(parseInt(items[0].date))}.`
      }
      let type = ""
      if(items[0].type){
        type = `It is a ${items[0].type}.`
      }
      let tags = ""
      if(items[0].tags){
        tags = `It is tagged as ${items[0].tags}.`
      }
      let rarity = ""
      if(items[0].rarity){
        rarity = `It's rarity is ${items[0].rarity}.`
      }
      let stats = ""
      if(items[0].stats){
        stats = `It's stats are ${items[0].stats}.`
      }
      let key = ""
      if(items[0].password){
        key = "It can be used as a key."
      }
      let macro = ""
      if(items[0].macro){
        macro = `It is enchanted to "${player.username} ${items[0].macro}".`
      }
      sendEvent<string>(socket, LOG_EVENT, creator + date + type + tags + rarity + stats + key + macro)
    }else if (inventory.length > 0){
      let creator = ""
      if(inventory[0].creator){
        const player = await getPlayerById(Number(inventory[0].creator))
        creator = `This ${inventory[0].name} was created by ${player?.username}.`
      }else{
        creator = `A ${inventory[0].name}.`
      }
      let date = ""
      if(inventory[0].date){
        date = `It was made on ${new Date(parseInt(inventory[0].date))}.`
      }
      let type = ""
      if(inventory[0].type){
        type = `It is a ${inventory[0].type}.`
      }
      let tags = ""
      if(inventory[0].tags){
        tags = `It is tagged as ${inventory[0].tags}.`
      }
      let rarity = ""
      if(inventory[0].rarity){
        rarity = `It's rarity is ${inventory[0].rarity}.`
      }
      let stats = ""
      if(inventory[0].stats){
        stats = `It's stats are ${inventory[0].stats}.`
      }
      let key = ""
      if(inventory[0].password){
        key = "It can be used as a key."
      }
      let macro = ""
      if(inventory[0].macro){
        macro = `It is enchanted to "${player.username} ${inventory[0].macro}".`
      }
      sendEvent<string>(socket, LOG_EVENT, creator + date + type + tags + rarity + stats + key + macro)
    }else{
      sendEvent<string>(socket, LOG_EVENT, "use the name of an item")
    }
    
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(INSIGHT_EVENT, handler)
