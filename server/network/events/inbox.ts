import {
  NetworkEventHandler,
  networkEmitter,
} from "./emitter"
import {
  sendEvent,
} from "../"
import {
  INBOX_EVENT,
  ERROR_EVENT,
  INBOX_HISTORY_EVENT,
} from "../../../events"
import { fetchInbox } from "../../services/chat"
import { Chat } from "../../../@types"

const handler: NetworkEventHandler = async (socket, playerId: number) => {
  try {
    const chats = await fetchInbox(playerId)

    sendEvent<Chat[]>(socket, INBOX_HISTORY_EVENT, chats)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(INBOX_EVENT, handler)
