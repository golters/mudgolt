import {
  NetworkEventHandler,
  networkEmitter,
} from "./emitter"
import {
  sendEvent,
} from "../"
import {
  CHANGE_MUSIC_EVENT,
  MUSIC_UPDATE_EVENT,
  ERROR_EVENT,
} from "../../../events"
import {
  updateRoomMusic,
  getMusicByRoom,
} from "../../services/music"
import { Music } from "../../../@types"

const handler: NetworkEventHandler = async (socket, roomID: number) => {
  try {
    const oldMusic = await getMusicByRoom(roomID)
    if(oldMusic === undefined){
      const newMusic = await updateRoomMusic(roomID)
      sendEvent<Music>(socket, MUSIC_UPDATE_EVENT, newMusic)
    }else{      
      sendEvent<Music>(socket, MUSIC_UPDATE_EVENT, oldMusic)
    }

  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(CHANGE_MUSIC_EVENT, handler)
