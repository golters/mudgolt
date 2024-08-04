import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  UFO_EVENT,
  SERVER_LOG_EVENT,
  ERROR_EVENT,
  NOTIFICATION_EVENT,
  REFRESH_EVENT,
  ROOM_UPDATE_EVENT,
  MUSIC_UPDATE_EVENT,
} from "../../../events"
import {
  online,
  sendEvent, 
  broadcastToRoom,
  broadcastToUser,
} from "../"
import { 
  abduction,
  addPlayerGolts, 
  getPlayerById, 
  payPlayer,
} from "../../services/player"
import {
  getRoomById,
} from "../../services/room"
import {
  createPocketItem,
} from "../../services/item"
import {
  getMusicByRoom,
  updateRoomMusic,
} from "../../services/music"
import { GOLT } from "../../../constants"
import { Room, Music } from "@types"

const handler: NetworkEventHandler = async (socket, playerID: number) => {
  try {   
    const player = await getPlayerById(playerID)
    const lastpaid = player?.lastPaid
    if(!lastpaid){
      return
    }
    if(!player){
      sendEvent<string>(socket, ERROR_EVENT, "no player")

      return
    }
    const oldRoom = await getRoomById(player.roomId)
    const list = online.map(o => o.player.username)
    if(list.includes(player.username)){
      
    }else{
      sendEvent<string>(socket, ERROR_EVENT, "a bug has occured, you are no longer online")
      sendEvent<string>(socket, REFRESH_EVENT, "oops")
    }
    if(!player.lastPaid){      

      return
    }
    const newroom = await abduction(player.id)

    
    const oldMusic = await getMusicByRoom(newroom.id)
    if(oldMusic === undefined){
      const newMusic = await updateRoomMusic(newroom.id)
      sendEvent<Music>(socket, MUSIC_UPDATE_EVENT, newMusic)
    }else{      
      sendEvent<Music>(socket, MUSIC_UPDATE_EVENT, oldMusic)
    }


    broadcastToRoom<Room>(ROOM_UPDATE_EVENT, oldRoom, oldRoom.id)
    broadcastToRoom<string>(SERVER_LOG_EVENT, player.username + " has been abducted by aliens", oldRoom.id)
    broadcastToRoom<string>(NOTIFICATION_EVENT, "teleportExit", oldRoom.id);
    //await insertRoomCommand(oldRoom.id, player.id, `has teleported from ${oldRoom.name}`, Date.now(), "tp")
    broadcastToRoom<Room>(ROOM_UPDATE_EVENT, newroom, newroom.id)
    broadcastToRoom<string>(SERVER_LOG_EVENT, player.username + " has appeared", newroom.id)
    broadcastToUser<string>(SERVER_LOG_EVENT, "you have been abducted by aliens", player.username)
    broadcastToRoom<string>(NOTIFICATION_EVENT, "teleportEnter", newroom.id);
    if(Math.random() * 1000 < 1)
      await createPocketItem(player.id, "alien_artifact", null, "2", "alien,artifact","alien,artifact")
    //await insertRoomCommand(room.id, player.id, `has teleported into ${room.name}`, Date.now(), "tp")
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(UFO_EVENT, handler)
