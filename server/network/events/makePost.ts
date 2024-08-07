import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  ERROR_EVENT,
  MAKE_POST_EVENT,
  SERVER_LOG_EVENT,
} from "../../../events"
import {
  sendEvent,
} from "../../network"
import {
  createPost,
} from "../../services/item"
import { ITEM_COST, GOLT, ITEM_MAX_NAME } from "../../../constants"
import {
  takePlayerGolts,
} from "../../services/player"
import {
  getCurrentEvent,
  getBearName,
} from "../../services/event"

const handler: NetworkEventHandler = async (socket, args: string, player) => {
  try {    
    if(!args){
      sendEvent<string>(socket, ERROR_EVENT, "post is empty")
      
      return
    }
    const name = player.username
    const cost = args.length + ITEM_COST
    if(name.length > ITEM_MAX_NAME){
      sendEvent<string>(socket, ERROR_EVENT, `max length is ${ITEM_MAX_NAME} characters`)
      
      return
    }
    if(player.golts <= cost){
      sendEvent<string>(socket, SERVER_LOG_EVENT, `you need ${GOLT}${cost}`)

      return
    }
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
    await createPost(player.id, args) 
    await takePlayerGolts(player.id, cost)
    sendEvent<string>(socket, SERVER_LOG_EVENT, `-${GOLT}${cost}`)
    sendEvent<string>(socket, SERVER_LOG_EVENT, `${username} Created a post`)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}


networkEmitter.on(MAKE_POST_EVENT, handler)
