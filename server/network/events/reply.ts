import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  broadcastToUser,
  sendEvent,
  online,
} from ".."
import {
  REPLY_EVENT,
  SERVER_LOG_EVENT,
  ERROR_EVENT,
  LOG_EVENT,
  NOTIFICATION_EVENT,
} from "../../../events"
import {
  Player,
} from "../../../@types"
import {
  getPlayerByUsername,
} from "../../services/player"
import {
  insertWhisper,
  fetchInbox,
} from "../../services/chat"

const handler: NetworkEventHandler = async (
  socket,
  input: string[],
  player: Player,
) => {
  try {  
    const inbox = await fetchInbox(player.id)
    let lastmessage = inbox[0]
    inbox.forEach(chat => {
      if(chat.recipiant?.username === player.username){
        lastmessage = chat
      }
    });
    if(inbox.length === 0 || lastmessage.player === player){
      sendEvent<string>(socket, ERROR_EVENT, "No one has messaged you")
      
      return      
    }
    const name = lastmessage.player.username
    if(!name){
      sendEvent<string>(socket, ERROR_EVENT, "User does not exist")
      
      return
    }
    const user = await getPlayerByUsername(name)
    if (!user) {
      sendEvent<string>(socket, ERROR_EVENT, "User does not exist")

      return
    }
    const message = input.join(" ")

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
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(REPLY_EVENT, handler)
