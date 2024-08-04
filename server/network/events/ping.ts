import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  PING_EVENT, 
  ERROR_EVENT,
  PONG_EVENT,
} from "../../../events"
import {
  online,
  sendEvent, 
} from "../"

const handler: NetworkEventHandler = (socket, player) => {
  let test = false
  online.forEach(c =>{
    if(c.player === player)
      test = true
  });
  if(test === false){
    //sendEvent<string>(socket, ERROR_EVENT, "a bug has occured, you are no longer online")
  }
  sendEvent<null>(socket, PING_EVENT, null)
  sendEvent<string>(socket, PONG_EVENT, "pong " + player)
}

networkEmitter.on(PING_EVENT, handler)
