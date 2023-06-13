import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  broadcastToUser,
  broadcastToRoom,
  sendEvent,
  online,
} from ".."
import {
  EVENT_EVENT,
  SERVER_LOG_EVENT,
  ERROR_EVENT,
  LOG_EVENT,
  NOTIFICATION_EVENT,
  GAME_UPDATE_EVENT,
  BANNER_UPDATE_EVENT,
  ROOM_UPDATE_EVENT,
  CHAT_EVENT,
  EVENT_UPDATE_EVENT,
} from "../../../events"
import {
  Player,
  Room,
  Chat,
} from "../../../@types"
import {
  clearOldEvents,
  createEvent, createEventTag, createRandomEvent, fishWinner, getCurrentEvent, getUpcomingEvents, givePoints,
} from "../../services/event"
import {
  insertRoomChat,
} from "../../services/chat"
import { getRoomById } from "../../services/room"
import { createItem, setItemBio } from "../../services/item"

const fishTypes =[
  "trout",
  "carp",
  "bass",
  "cod",
  "herring",
  "eel",
  "tuna",
  "haddock",
  "fish",
  "shark",
  "whale",
  "crab",
  "lobster",
  "shrimp",
  "squid",
]

const handler: NetworkEventHandler = async (
  socket,
  input: string,
  player: Player,
) => {
  try {   
    const args = input.split(" ")

    const {
      username,
    } = player

    const chat: Chat = {
      player: {
        username,
      },
      message: input,
      date: Date.now(),
      recipiant: null,
      type: "chat",
    }
  
    const now = new Date();
    switch(args[0]){
      case "/event":
        switch(args[1]){
          case "new":
            const start = Number(now) + 60000 * 3
            const length = 60000 * 3
            await createEvent(args[2],start, start + length);
            broadcastToUser<string>(SERVER_LOG_EVENT,"new event", player.username); 
  
            return;
          case "list":
            const events = await getUpcomingEvents(Date.now());
            let list = ""
            for (let i = 0; i < events.length; i++) {
              list = list + events[i].type + " "
            }
            if(events.length === 0){
              list = "there are no upcoming events"
            }
            broadcastToUser<string>(SERVER_LOG_EVENT, list, player.username); 
  
            return;
          case "check":
            await clearOldEvents(Date.now())
            const event = await getCurrentEvent(Date.now())
            if(event){
              sendEvent<Event>(socket, EVENT_UPDATE_EVENT, event)
            }else{
              const events = await getUpcomingEvents(Date.now());
              if(events.length === 0){
                await createRandomEvent(Date.now())

              }else{         
                sendEvent<Event>(socket, EVENT_UPDATE_EVENT, events[0])
              }
            }
            
            return;
          default:
            broadcastToUser<string>(SERVER_LOG_EVENT,"don't use this command", player.username); 
  
            return;
        }

        return;
      case "/fish":
        const event = await getCurrentEvent(Date.now())
        if(event && event.type === "Fishing_Tournament"){
          const fishSucess = Math.random() * 100
          if(fishSucess > 50){
            const room = await (await getRoomById(player.roomId)).name
            const roomarray = room.split(/(?:-|_| )+/)
            for(let i = 0; i < roomarray.length; i++){
              if(Number.isNaN(roomarray[i])){
                delete roomarray[i]
              }
              if(roomarray[i].length === 1){
                delete roomarray[i]
              }
              if(roomarray[i] === "left" || roomarray[i] === "right"
              || roomarray[i] === "north"|| roomarray[i] === "east"|| roomarray[i] === "south"|| roomarray[i] === "west"){
                delete roomarray[i]
              }
            }
            const areaNameNum = Math.round(Math.random() * (roomarray.length -1))
            const areaName = roomarray[areaNameNum]
            const fishtype = fishTypes[Math.round(Math.random() * (fishTypes.length - 1))]
            const fishName = areaName + "_" + fishtype
  
            broadcastToUser<string>(SERVER_LOG_EVENT, "you caught a " + fishName, player.username); 
            const fish = await createItem(player.id,fishName) 
            const fishSize = Math.random() * 10
            await setItemBio(fish.id, "A " + Math.round(fishSize).toString() + " inch " + fishtype + " caught in " + room)
            await givePoints(player.id, Math.round(fishSize).toString(), event.id)
          }else{
            broadcastToUser<string>(SERVER_LOG_EVENT, "you caught nothing, try again", player.username); 
          }
          
        }else{
          broadcastToRoom<Chat>(CHAT_EVENT, chat, player.roomId)  
          await insertRoomChat(player.roomId, player.id, input, chat.date)
          broadcastToRoom<string>(NOTIFICATION_EVENT, "chat", player.roomId);
        }

        return;
    }    
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(EVENT_EVENT, handler)
