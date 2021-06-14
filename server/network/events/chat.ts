import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  broadcastToRoom,
  sendEvent,
} from "../"
import {
  CHAT_EVENT, 
  ERROR_EVENT,
} from "../../../events"
import {
  MESSAGE_MAX_LENGTH, 
} from "../../../constants"
import { Chat } from "@types"
import {
  insertRoomChat,
} from "../../services/chat"

const handler: NetworkEventHandler = async (socket, message: string, player) => {
  try {
    if (message.length > MESSAGE_MAX_LENGTH) {
      return
    }
  
    const {
      username,
    } = player
  
    const chat: Chat = {
      player: {
        username,
      },
      message,
      date: Date.now(),
    }
  
    broadcastToRoom<Chat>(CHAT_EVENT, chat, player.roomId)
  
    await insertRoomChat(player.roomId, player.id, message, chat.date)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(CHAT_EVENT, handler)
