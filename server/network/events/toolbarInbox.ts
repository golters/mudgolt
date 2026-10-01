import {
  type NetworkEventHandler,
  networkEmitter,
} from "./emitter.ts"
import {
  sendEvent,
} from "../index.ts"
import {
  ERROR_EVENT,
  INBOX_UPDATE_EVENT,
  CORRESPONDENTS_UPDATE_EVENT,
  MORE_INBOX_EVENT,
} from "../../../events.ts"
import type {
  Chat,
} from "../../../@types/index.ts"
import {
  broadcastToUser,
} from "../../network/index.ts"
import { fetchCorrespondent, fetchInbox } from "../../services/chat.ts"

const handler: NetworkEventHandler = async (socket, args: string, player) => {
  try {
    const page = Number(args[0])
    const user = args[1]
    const inbox = await fetchInbox(player.id, (page*20) + 20, user)
    broadcastToUser<Chat[]>(INBOX_UPDATE_EVENT, inbox, player.username)
    const correspondents = await fetchCorrespondent(player.id)
    broadcastToUser<string[]>(CORRESPONDENTS_UPDATE_EVENT, correspondents, player.username)

  }catch(error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(MORE_INBOX_EVENT, handler)
