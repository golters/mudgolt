import {
  networkEmitter, type NetworkEventHandler,
} from "./emitter.ts"
import {
  sendEvent,
} from "../index.ts"
import {
  ME_EVENT,
  SERVER_LOG_EVENT,
  ERROR_EVENT,
  NOTIFICATION_EVENT,
} from "../../../events.ts"
import type {
  Player,
} from "../../../@types/index.ts"
import {
  broadcastToRoom,
} from "../../network/index.ts"
import {
  getRoomById,
} from "../../services/room.ts"
import {
  insertRoomCommand,
} from "../../services/chat.ts"
import {
  getCurrentEvent,
  getBearName,
} from "../../services/event.ts"

const handler: NetworkEventHandler = async (
  socket,
  message: string,
  player: Player,
) => {
  try {
    const room = await getRoomById(player.roomId)    
    let username = player.username
    const event = await getCurrentEvent(Date.now())    
    if(event){
      switch (event.type){
        case "Bear_Week":
          const bearname = await getBearName(event.id, player.id)
          if(bearname){
            username = bearname
          }

          break;
      }
    }  
    broadcastToRoom<string>(SERVER_LOG_EVENT, username + " " + message, room.id);
    await insertRoomCommand(room.id, player.id, message, Date.now(), "me")
    broadcastToRoom<string>(NOTIFICATION_EVENT, "me", room.id);
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(ME_EVENT, handler)
