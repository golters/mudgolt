import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  sendEvent,
} from "../"
import {
  CHAT_HISTORY_EVENT, 
  ERROR_EVENT,
} from "../../../events"
import {
} from "../../../constants"
import {
  fetchRoomChats,
} from "../../services/chat"
import { Chat } from "../../../@types"

const handler: NetworkEventHandler = async (socket, payload: null, player) => {
  try {
    const chats = await fetchRoomChats(player.roomId)

    sendEvent<Chat[]>(socket, CHAT_HISTORY_EVENT, chats)
    
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(CHAT_HISTORY_EVENT, handler)
