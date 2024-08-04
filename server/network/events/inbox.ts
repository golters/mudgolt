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
import { getPlayerByUsername } from "../../services/player"
import { Chat } from "../../../@types"

const handler: NetworkEventHandler = async (socket, args: string[], player) => {
  try {
    let chats = await fetchInbox(player.id, 200,null)
    if (args.length == 1){
      if(args[0] === player.username){        
        sendEvent<string>(socket, ERROR_EVENT, "that's you, put someone elses name")

        return
      }
      const id = await getPlayerByUsername(args[0])
      if(id){
        chats = chats.filter(chat => chat.recipiant?.username === id.username || chat.player.username === id.username)
      }else{
        sendEvent<string>(socket, ERROR_EVENT, "that isn't a real user")

        return
      }
    }
    if(chats.length > 0){
      sendEvent<Chat[]>(socket, INBOX_HISTORY_EVENT, chats)
    }else{
      if(args.length === 0){
        sendEvent<string>(socket, ERROR_EVENT, "you have no whispers")
      }else{
        sendEvent<string>(socket, ERROR_EVENT, "you have no whispers with that user")
      }
    }

  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(INBOX_EVENT, handler)
