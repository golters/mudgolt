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
import {
  insertRoomCommand,
} from "../../services/chat"

const handler: NetworkEventHandler = async (socket, player) => {
  let onlinecheck = false
  online.forEach(element => {      
    if(element.player.username === player.username){
      onlinecheck = true
    }        
  });
  if(onlinecheck === false){
    const lastPinged = Date.now()
    const room = await getRoomById(player.roomId)
    broadcastToRoom(SERVER_LOG_EVENT, `${player.username} is now online`, player.roomId)
    broadcastToRoom(NOTIFICATION_EVENT, "online", player.roomId); 
    broadcastToRoom(SERVER_LOG_EVENT, `${player.username} has joined ${room.name}`, player.roomId)
    insertRoomCommand(player.roomId, player.id, "came online", Date.now(), "online")
    online.push({
      socket,
      player,
      lastPinged,
    })
  }
}

networkEmitter.on(FOCUS_EVENT, handler)
