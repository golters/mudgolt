import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  broadcastToRoom,
  sendEvent,
} from "../"
import {
  CHAT_EVENT, 
  ERROR_EVENT,
  NOTIFICATION_EVENT,
} from "../../../events"
import {
  MESSAGE_MAX_LENGTH, 
} from "../../../constants"
import { Chat } from "@types"
import {
  insertRoomChat,
} from "../../services/chat"
import {
  getBearName,
  getCurrentEvent, getEventTag,
} from "../../services/event"

export const zombieSlurs = [
  "... ",
  "aaa ",
  "aaagh ",
  "bbBRAINS! ",
  "uuuugh ",
  "ooogh ",
  "... b... b... BRAIN! ",
]

const handler: NetworkEventHandler = async (socket, message: string, player) => {
  try {
    if (message.length > MESSAGE_MAX_LENGTH) {
      return
    }

    let filteredMessage = message
    const event = await getCurrentEvent(Date.now())
    let {
      username,
    } = player
    if(event){
      switch (event.type){
        case "Zombie_Invasion":
          const tag = await getEventTag(player.id, "player", event.id)
          if(tag){
            filteredMessage = ""
            const brokenMessage = message.split(" ")
            brokenMessage.forEach(word => {
              let slur = " "
              if(Math.random() > 0.2){
                slur = zombieSlurs[Math.round(Math.random() * (zombieSlurs.length - 1))]
              }
              filteredMessage = filteredMessage + word + slur         
            });
          }
          break;
        case "Bear_Week":
          const bearname = await getBearName(event.id, player.id)
          if(bearname){
            username = bearname
          }

          break;
      }
    }
  
  
    const chat: Chat = {
      player: {
        username,
      },
      message: filteredMessage,
      date: Date.now(),
      recipiant: null,
      type: "chat",
    }
  
    broadcastToRoom<Chat>(CHAT_EVENT, chat, player.roomId)
  
    await insertRoomChat(player.roomId, player.id, filteredMessage, chat.date)
    broadcastToRoom<string>(NOTIFICATION_EVENT, "chat", player.roomId);
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(CHAT_EVENT, handler)
