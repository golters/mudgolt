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

const handler: NetworkEventHandler = (socket, message: string, player) => {
  if (message.length > MESSAGE_MAX_LENGTH) {
    return
  }

  broadcastToRoom(CHAT_EVENT, {
    player,
    message,
  }, player.room)
}

networkEmitter.on(CHAT_EVENT, handler)
