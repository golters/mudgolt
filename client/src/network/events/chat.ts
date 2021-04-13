import { emitter, EventHandler } from "./emitter"
import { CHAT_EVENT, LOG_EVENT } from "../../../../events"
import { commandEmitter } from "../../commands"
import { ChatMessage } from "../../components/terminal"

const handler: EventHandler = (socket, payload) => {
  commandEmitter.emit(LOG_EVENT, ChatMessage(payload))
}

emitter.on(CHAT_EVENT, handler)
