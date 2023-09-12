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
} from "../../services/event"
import {
  insertRoomChat,
} from "../../services/chat"
import { getRoomById } from "../../services/room"
import { createItem, setItemBio } from "../../services/item"
import { cheat, takePlayerGolts } from "../../services/player"
import {
  GOLT,
} from "../../../constants"

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
  "dolphin",
  "whale",
  "crab",
  "lobster",
  "shrimp",
  "squid",
  "octopus",
  "mermaid",
  "kraken",
  "seagull",
  "ray",
  "clam",
  "urchin",
  "trilobite",
  "turtle",
  "piranha",
  "frog",
  "tin_can",
  "penguin",
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
        }

        return;
      case "/fish":
        if(event && event.type === "Fishing_Tournament"
        ){
          const fishSucess = Math.random() * 100
          const chance = 99-(Number(String(player.roomId + event.id).slice(-1))/2)*5
          let areaNameNum = 0
          if(fishSucess > chance){
            const room = await (await getRoomById(player.roomId)).name
            const roomarray = room.split(/(?:-|_| )+/)
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
              
              areaNameNum = Math.round(Math.random() * (roomarray.length-1))
            }

            const areaName = roomarray[areaNameNum]
            const fishtype = fishTypes[Math.round(Math.random() * (fishTypes.length-1))]
            const fishName = areaName + "_" + fishtype
  
            broadcastToUser<string>(SERVER_LOG_EVENT, "you caught a " + fishName, player.username); 
            const fish = await createItem(player.id,fishName) 
            //const fishSize = Math.random() * 480
            const fishSize = Math.pow(Math.floor(Math.random()*400), 1/3);
            await setItemBio(fish.id, "A " + Math.round(fishSize).toString() + " inch " + fishtype + " caught in " + room)
            await givePoints(player.id, Math.round(fishSize).toString(), event.id)
          }else{
            broadcastToUser<string>(SERVER_LOG_EVENT, "you caught nothing, try again", player.username); 
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
