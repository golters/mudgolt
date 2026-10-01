import {
  networkEmitter, type NetworkEventHandler,
} from "./emitter.ts"
import {
  sendEvent,
} from "../index.ts"
import {
  CHAT_HISTORY_EVENT, 
  ERROR_EVENT,
  HISTORY_EVENT,
} from "../../../events.ts"
import {
} from "../../../constants.ts"
import {
  fetchRoomChats,
} from "../../services/chat.ts"
import type { Chat } from "../../../@types/index.ts"

const handler: NetworkEventHandler = async (socket, amount: number, player) => {
  try {
    const chats = await fetchRoomChats(player.roomId)
    let loglength = 0
    if(amount > chats.length){
      sendEvent<string>(socket, ERROR_EVENT, `there are only ${chats.length} messages in this room`)
    }else{
      loglength = chats.length - amount
    }
    const log = chats.splice(loglength)

    sendEvent<Chat[]>(socket, CHAT_HISTORY_EVENT, log)
    
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(HISTORY_EVENT, handler)
