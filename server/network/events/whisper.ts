import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  broadcastToUser,
  sendEvent,
  online,
} from ".."
import {
  WHISPER_EVENT,
  SERVER_LOG_EVENT,
  ERROR_EVENT,
  LOG_EVENT,
  NOTIFICATION_EVENT,
  INBOX_UPDATE_EVENT,
  CORRESPONDENTS_UPDATE_EVENT,
  TOOLBAR_UPDATE_EVENT,
  WHISPER_POPUP_EVENT,
} from "../../../events"
import {
  Player,
  Chat,
} from "../../../@types"
import {
  getPlayerByUsername,
} from "../../services/player"
import {
  insertWhisper,
  fetchCorrespondent,
  fetchInbox,
} from "../../services/chat"

const handler: NetworkEventHandler = async (
  socket,
  input: string[],
  player: Player,
) => {
  try {    
    const name = input[0]
    const user = await getPlayerByUsername(name)
    if (!user) {
      sendEvent<string>(socket, ERROR_EVENT, "User does not exist")

      return
    }
    const message = input.splice(1).join(" ")
    //message = message.join(" ")

    if(message.length <= 0){      
      sendEvent<string>(socket, ERROR_EVENT, "you forgot to say something")

      return
    }
    if(user.username === player.username){      
      sendEvent<string>(socket, SERVER_LOG_EVENT, "you whispered '" + message + "' to yourself")

      return
    }
    let onlinecheck = false
    online.forEach(element => {      
      if(element.player.username === user.username){
        sendEvent<string>(socket, SERVER_LOG_EVENT, "you whispered '" + message + "' to " + name)
        broadcastToUser<string>(SERVER_LOG_EVENT, player.username + " whispered '" + message + "' to you", name); 
        broadcastToUser<string>(NOTIFICATION_EVENT, "whisper", name); 
        onlinecheck = true

        return     
      }
    });
       
    if(onlinecheck === false){
      sendEvent<string>(socket, SERVER_LOG_EVENT, name + " is not online but you whispered '" + message + "' into their inbox")
    }

    await insertWhisper(user.id, player.id, message, Date.now())
    //send inbox update
    const inbox = await fetchInbox(player.id, 20, null)
    broadcastToUser<Chat[]>(INBOX_UPDATE_EVENT, inbox, player.username)
    const correspondents = await fetchCorrespondent(player.id)
    broadcastToUser<string[]>(CORRESPONDENTS_UPDATE_EVENT, correspondents, player.username)
    //receiever inbox update
    const inbox2 = await fetchInbox(player.id, 20, null)
    broadcastToUser<Chat[]>(INBOX_UPDATE_EVENT, inbox2, name)
    const correspondents2 = await fetchCorrespondent(player.id)
    broadcastToUser<string[]>(CORRESPONDENTS_UPDATE_EVENT, correspondents2, name)
    broadcastToUser<string[]>(WHISPER_POPUP_EVENT, [player.username, message], name)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(WHISPER_EVENT, handler)
