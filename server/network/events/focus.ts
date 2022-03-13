import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  FOCUS_EVENT, 
  LOG_EVENT,
  SERVER_LOG_EVENT,
  NOTIFICATION_EVENT,
} from "../../../events"
import {
  online,
  sendEvent, 
  broadcastToRoom,
} from "../"
import {
  getRoomById,
} from "../../services/room"

const handler: NetworkEventHandler = async (socket, player) => {
  online.forEach(element => {    
    if(element.player.publicKey === player.publicKey){
      online.splice(online.findIndex(({ player }) => player.publicKey === element.player.publicKey), 1)
    }    
  });
  const lastPinged = Date.now()
  if(Date.now() > player.lastPinged + (30001)){
    const room = await getRoomById(player.roomId)
    broadcastToRoom(SERVER_LOG_EVENT, `${player.username} is now online`, player.roomId)
    broadcastToRoom(NOTIFICATION_EVENT, "online", player.roomId); 
    broadcastToRoom(SERVER_LOG_EVENT, `${player.username} has joined ${room.name}`, player.roomId)
  }
  online.push({
    socket,
    player,
    lastPinged,
  })
}

networkEmitter.on(FOCUS_EVENT, handler)
