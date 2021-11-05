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
} from "../../../events"
import {
  Player,
} from "../../../@types"
import {
  getPlayerByUsername,
} from "../../services/player"

const handler: NetworkEventHandler = async (
  socket,
  input: string,
  player: Player,
) => {
  try {    
    const split = input.split(" ")
    const name = split[1]
    const user = await getPlayerByUsername(name)
    if (!user) {
      sendEvent<string>(socket, ERROR_EVENT, "User does not exist")

      return
    }
    let message = input
    message = message.substring(10 + name.length)
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
        onlinecheck = true

        return     
      }
    });
       
    if(onlinecheck === false){
      sendEvent<string>(socket, ERROR_EVENT, name + " is not online")
    }

  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(WHISPER_EVENT, handler)
