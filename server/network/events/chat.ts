import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  broadcastToRoom,
} from "../"
import {
  CHAT_EVENT, 
} from "../../../events"
import {
  MESSAGE_MAX_LENGTH, 
} from "../../../constants"
import { Chat } from "@types"

const handler: NetworkEventHandler = (socket, message: string, player) => {
  if (message.length > MESSAGE_MAX_LENGTH) {
    return
  }

  const {
    username,
  } = player

  broadcastToRoom<Chat>(CHAT_EVENT, {
    player: {
      username,
    },
    message,
  }, player.roomId)
}

networkEmitter.on(CHAT_EVENT, handler)
