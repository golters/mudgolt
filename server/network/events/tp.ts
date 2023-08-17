import {
  networkEmitter, NetworkEventHandler,
} from "./emitter"
import {
  ERROR_EVENT,
  TP_EVENT,
  ROOM_UPDATE_EVENT,
  SERVER_LOG_EVENT,
  LOG_EVENT,
  NOTIFICATION_EVENT,
  MUSIC_UPDATE_EVENT,
} from "../../../events"
import {
  broadcastToRoom,
  sendEvent,
} from "../../network"
import {
  setPlayerRoomByName,
} from "../../services/player"
import {
  getRoomById,
  getRoomByName,
  lookByID,
} from "../../services/room"
import { Room,Music } from "@types"
import {
  TELEPORT_COST,
  GOLT,
} from "../../../constants"
import {
  insertRoomCommand,
} from "../../services/chat"
import {
  getMusicByRoom,
  updateRoomMusic,
} from "../../services/music"
import {
  getCurrentEvent,
  getEventTag,
  getBearName,
} from "../../services/event"

const handler: NetworkEventHandler = async (socket, roomNameInput: string, player) => {
  try {
    const oldRoom = await getRoomById(player.roomId)

    const newRoom = await getRoomByName(roomNameInput)
 
    if (!oldRoom) {
      sendEvent<string>(socket, ERROR_EVENT, "Room doesn't exist")

      return
    }
    if (!newRoom) {
      sendEvent<string>(socket, ERROR_EVENT, "Room doesn't exist")

      return
    }

    const roomName = roomNameInput.replace(/\s/g, "_")

    if (oldRoom.name === roomName) {
      sendEvent<string>(socket, ERROR_EVENT, "You're already there")

      return
    }
    const cost = TELEPORT_COST
    if(player.golts <= cost){
      sendEvent<string>(socket, SERVER_LOG_EVENT, `you need ${GOLT}${cost}`)

      return
    } 

    sendEvent<string>(socket, SERVER_LOG_EVENT, `-${GOLT}${cost}`)
    const room = await setPlayerRoomByName(player.id, roomName)

    const message = await lookByID(room.id)
    
    //update room music
    const oldMusic = await getMusicByRoom(room.id)
    if(oldMusic === undefined){
      const newMusic = await updateRoomMusic(room.id)
      sendEvent<Music>(socket, MUSIC_UPDATE_EVENT, newMusic)
    }else{      
      sendEvent<Music>(socket, MUSIC_UPDATE_EVENT, oldMusic)
    }
    const event = await getCurrentEvent(Date.now())
    let username = player.username
    let tpinmessage = `${username} has teleported in to ${room.name}`
    let tpoutmessage = `${username} has teleported from ${oldRoom.name}`
    if(event){
      switch (event.type){
        case "Zombie_Invasion":
          const tag = await getEventTag(player.id, "player", event.id)
          if(tag){
            broadcastToRoom<string>(NOTIFICATION_EVENT, "zombie", oldRoom.id);
            broadcastToRoom<string>(NOTIFICATION_EVENT, "zombie", room.id)
            tpinmessage = `${username} has teleported in to ${room.name} like a zombie`
            tpoutmessage = `${username} has teleported from ${oldRoom.name} like a zombie`
          }
  
          break;
        case "Bear_Week":
          const bearname = await getBearName(event.id, player.id)
          if(bearname){
            username = bearname
          }
          tpinmessage = `${username} has teleported in to ${room.name}`
          tpoutmessage = `${username} has teleported from ${oldRoom.name}`
  
          break;
      }
    }

    broadcastToRoom<Room>(ROOM_UPDATE_EVENT, oldRoom, oldRoom.id)
    broadcastToRoom<string>(SERVER_LOG_EVENT, tpinmessage, oldRoom.id)
    broadcastToRoom<string>(NOTIFICATION_EVENT, "teleportExit", oldRoom.id);
    //await insertRoomCommand(oldRoom.id, player.id, `has teleported from ${oldRoom.name}`, Date.now(), "tp")
    broadcastToRoom<Room>(ROOM_UPDATE_EVENT, room, room.id)
    broadcastToRoom<string>(SERVER_LOG_EVENT, tpoutmessage, room.id)
    broadcastToRoom<string>(NOTIFICATION_EVENT, "teleportEnter", room.id);
    //await insertRoomCommand(room.id, player.id, `has teleported into ${room.name}`, Date.now(), "tp")
    sendEvent<string>(socket, LOG_EVENT, message)    
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(TP_EVENT, handler)
