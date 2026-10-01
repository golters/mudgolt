import {
  networkEmitter, type NetworkEventHandler,
} from "./emitter.ts"
import {
  sendEvent,
} from "../index.ts"
import {
  CHAT_HISTORY_EVENT, 
  ERROR_EVENT,
} from "../../../events.ts"
import {
} from "../../../constants.ts"
import {
  fetchRoomChats,
} from "../../services/chat.ts"
import type { Chat } from "../../../@types/index.ts"

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
