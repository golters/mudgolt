import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  ERROR_EVENT,
  MAKE_ITEM_EVENT,
  SERVER_LOG_EVENT,
} from "../../../events"
import {
  sendEvent,
} from "../../network"
import {
  createItem,
} from "../../services/item"

const handler: NetworkEventHandler = async (socket, args: string, player) => {
  try {    
    await createItem(player.id, args)

    sendEvent<string>(socket, SERVER_LOG_EVENT, `${player.username} Created a ${args}`)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}


networkEmitter.on(MAKE_ITEM_EVENT, handler)
