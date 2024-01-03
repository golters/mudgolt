import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  broadcastToUser,
  broadcastToRoom,
  broadcast,
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
  createEvent, createEventTag, createRandomEvent, fishWinner, getCurrentEvent, getUpcomingEvents, givePoints, moveZombies,
  getEventTag,
  bitePlayer,
  endEvent,
  castVote,
  campaign,
  pollResults,
  clearAllEvents,
} from "../../services/event"
import {
  insertRoomChat,
} from "../../services/chat"
import { getRoomById } from "../../services/room"
import { createItem, createPocketItem, setItemBio } from "../../services/item"
import { cheat, takePlayerGolts } from "../../services/player"
import {
  GOLT,
} from "../../../constants"
import { fish } from "../../services/specialItems"

const waterRooms: string[] = [
  "water",
  "ocean",
  "river",
  "pond",
  "lake",
  "swamp",
  "fen",
  "marsh",
  "bog",
  "sewer",
  "sea",
  "dock",
  "pool",
  "dyke",
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
    
    const event = await getCurrentEvent(Date.now())
    switch(args[0]){
      case "/event":
        switch(args[1]){
          case "list":
            const events = await getUpcomingEvents(Date.now());
            let list = ""
            for (let i = 0; i < events.length; i++) {
              list = list + events[i].type + " starting:" + new Date(events[i].start) + " ending:" + new Date(events[i].end) + " , "
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
          case "clear":
            await clearAllEvents()
              
            return;
        }

        return;
      case "/fish":
        const room = await (await getRoomById(player.roomId)).name
        const roomarray = room.split(/(?:-|_| )+/)
        let areaNameNum = 0
        if(roomarray.length > 1){
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
          
          areaNameNum = Math.floor(Math.random() * (roomarray.length-1))
        }
        
        if((event && event.type === "Fishing_Tournament") || roomarray.some(r => waterRooms.includes(r))
        ){
          const fishSucess = Math.random() * 100
          let chance = 99
          if(event){
            chance = 99-(Number(String(player.roomId + event.id).slice(-1))/2)*5
          }else{
            chance = 99-(Number(String(player.roomId).slice(-1))/2)*10
          }
          if(fishSucess > chance){

            const areaName = roomarray[areaNameNum]
            const fishtype = fish[Math.floor(Math.random() * (fish.length-1))]
            const fishName = areaName + "_" + fishtype.name
            let rarity = fishtype.rarity
  
            broadcastToUser<string>(SERVER_LOG_EVENT, "you caught a " + fishName, player.username); 
            //const fishSize = Math.random() * 480
            const fishSize = Math.pow(Math.floor(Math.random()*400), 1/3);
            //xl + xxl message for big fish. increase rarity 
            if(fishSize > 10){
              rarity = rarity + 1;
              broadcastToUser<string>(SERVER_LOG_EVENT, "wow it's big!", player.username); 

            }else if(fishSize > 50){
              rarity = rarity + 2;
              broadcastToUser<string>(SERVER_LOG_EVENT, "wow it's XL!", player.username); 

            }else if(fishSize > 100){
              rarity = rarity + 3;
              broadcastToUser<string>(SERVER_LOG_EVENT, "wow it's XXL!", player.username); 
              
            }else if(fishSize > 200){
              rarity = rarity + 4;
              broadcastToUser<string>(SERVER_LOG_EVENT, "wow it's XXXL!", player.username); 
              
            }else if(fishSize > 300){
              rarity = rarity + 5;
              broadcastToUser<string>(SERVER_LOG_EVENT, "wow it's XXXXL!", player.username); 
              
            }
            const fishitem = await createPocketItem(player.id, fishName, "123456123456123456", rarity, "fish,"+fishtype.name+","+fishSize+"inches,"+areaName+","+room, "fish")
            await setItemBio(fishitem.id, "A " + Math.floor(fishSize).toString() + " inch " + fishtype.name + " caught in " + room)
            if(event)
              await givePoints(player.id, Math.floor(fishSize).toString(), event.id)
          }else{
            broadcastToUser<string>(SERVER_LOG_EVENT, "you caught nothing, try again", player.username); 
            if(chance > 80){
              broadcastToUser<string>(SERVER_LOG_EVENT, "there doesn't seem to be many fish here, try somewhere else", player.username); 
            }
          }
          broadcastToUser<string>(NOTIFICATION_EVENT, "fish", player.username); 
          
        }else{
          broadcastToRoom<Chat>(CHAT_EVENT, chat, player.roomId)  
          await insertRoomChat(player.roomId, player.id, input, chat.date)
          broadcastToRoom<string>(NOTIFICATION_EVENT, "chat", player.roomId);
        }

        return;
      case "/bite":
        if(event && event.type === "Zombie_Invasion"){
          const tag = await getEventTag(player.id, "player", event.id)
          if(tag){
            if(args.length === 2){
              await bitePlayer(event.id, args[1], player.id)
            }else{
              broadcastToUser<string>(ERROR_EVENT,"bite who?", player.username); 
            }
          }
        }else{
          broadcastToRoom<Chat>(CHAT_EVENT, chat, player.roomId)  
          await insertRoomChat(player.roomId, player.id, input, chat.date)
          broadcastToRoom<string>(NOTIFICATION_EVENT, "chat", player.roomId);
        }
        break;
      case "/campaign":
        if(event && event.type === "Election_Day"){
          if(args.join(" ").length > 100){
            broadcastToUser<string>(ERROR_EVENT, "campaign message too long", player.username)

          }else
          if(args.length >= 1){
            await campaign(event, Date.now(),player.id, args)
          }else{
            broadcastToUser<string>(ERROR_EVENT, "you didn't say anything", player.username)
          }

        }else{
          broadcastToRoom<Chat>(CHAT_EVENT, chat, player.roomId)  
          await insertRoomChat(player.roomId, player.id, input, chat.date)
          broadcastToRoom<string>(NOTIFICATION_EVENT, "chat", player.roomId);
        }

        break;
      case "/vote":
        if(event && event.type === "Election_Day"){
          if(args.length >= 2){
            if(args[1]){
              await castVote(event, player.id, args[1])
            }
          }else{
            broadcastToUser<string>(ERROR_EVENT, "you didn't vote for anyone", player.username)
          }
          

        }else{
          broadcastToRoom<Chat>(CHAT_EVENT, chat, player.roomId)  
          await insertRoomChat(player.roomId, player.id, input, chat.date)
          broadcastToRoom<string>(NOTIFICATION_EVENT, "chat", player.roomId);
        }
  
        break;
      case "/poll":
        if(event && event.type === "Election_Day"){
          const message = await pollResults(event)
          broadcastToUser<string>(SERVER_LOG_EVENT, message, player.username)

        }else{
          broadcastToRoom<Chat>(CHAT_EVENT, chat, player.roomId)  
          await insertRoomChat(player.roomId, player.id, input, chat.date)
          broadcastToRoom<string>(NOTIFICATION_EVENT, "chat", player.roomId);
        }
    
        break;
      case "/cheat":
        await cheat(player.id, args[1])

        break;
    }    
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(EVENT_EVENT, handler)
