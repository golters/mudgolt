import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  ERROR_EVENT,
  GO_EVENT,
  ROOM_UPDATE_EVENT,
  SERVER_LOG_EVENT,
  LOG_EVENT,
  NOTIFICATION_EVENT,
  MUSIC_UPDATE_EVENT,
  LOOK_LOG_EVENT,
} from "../../../events"
import {
  broadcastToRoom,
  broadcastToUser,
  sendEvent,
} from "../../network"
import {
  setPlayerRoomByName, 
} from "../../services/player"
import { getRoomById,getLookByID } from "../../services/room"
import { getDoorByName, getTargetDoor } from "../../services/door"
import {
  Room,
  Music,
  Look,
} from "@types"
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

const handler: NetworkEventHandler = async (socket, doorName: string, player) => {
  try {
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
    const oldRoom = await getRoomById(player.roomId)
    
    await getDoorByName(player.roomId, doorName);

    const { target_room_id: roomId } = await getTargetDoor(oldRoom.id, doorName)

    const newRoom = await getRoomById(roomId)

    if (oldRoom.name === newRoom.name) {
      return
    }

    if (typeof newRoom.name !== "string") {
      sendEvent<string>(socket, ERROR_EVENT, "name not string")

      return
    }

    const room = await setPlayerRoomByName(player.id, newRoom.name.replace(/\s/g, "_"))	  

    const message = await getLookByID(newRoom.id)
    
    //update room music
    const oldMusic = await getMusicByRoom(room.id)
    if(oldMusic === undefined){
      const newMusic = await updateRoomMusic(room.id)
      sendEvent<Music>(socket, MUSIC_UPDATE_EVENT, newMusic)
    }else{      
      sendEvent<Music>(socket, MUSIC_UPDATE_EVENT, oldMusic)
    }
    
    let leaveMessage = `${username} has left ${oldRoom.name} through the ${doorName}`
    let enterMessage = `${username} has joined ${room.name}`
    if(event){
      if(event.type === "Zombie_Invasion"){
        const tag = await getEventTag(player.id, "player", event.id)
        if(tag){
          leaveMessage = `${username} shuffles out of ${oldRoom.name} through the ${doorName}`
          enterMessage = `${username} shuffled into ${room.name}`
          broadcastToRoom<string>(NOTIFICATION_EVENT, "zombie", oldRoom.id);
          broadcastToRoom<string>(NOTIFICATION_EVENT, "zombie", room.id)
        }
      }
    }
    broadcastToRoom<Room>(ROOM_UPDATE_EVENT, oldRoom, oldRoom.id)
    broadcastToRoom<string>(SERVER_LOG_EVENT, leaveMessage, oldRoom.id)
    broadcastToRoom<string>(NOTIFICATION_EVENT, "doorExit", oldRoom.id);
    //await insertRoomCommand(oldRoom.id, player.id, `has left ${oldRoom.name} through the ${doorName}`, Date.now(), "go")
    broadcastToRoom<Room>(ROOM_UPDATE_EVENT, room, room.id)
    broadcastToRoom<string>(SERVER_LOG_EVENT, enterMessage, room.id)
    broadcastToRoom<string>(NOTIFICATION_EVENT, "doorEnter", room.id)
    //await insertRoomCommand(room.id, player.id, `has joined ${room.name}`, Date.now(), "go")
    //sendEvent<Look>(socket, LOOK_LOG_EVENT, message)    
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(GO_EVENT, handler)
