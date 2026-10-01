import {
  type NetworkEventHandler,
  networkEmitter,
} from "./emitter.ts"
import {
  sendEvent,
} from "../index.ts"
import {
  CHANGE_MUSIC_EVENT,
  MUSIC_UPDATE_EVENT,
  ERROR_EVENT,
} from "../../../events.ts"
import {
  updateRoomMusic,
  getMusicByRoom,
} from "../../services/music.ts"
import type { Music } from "../../../@types/index.ts"

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
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(CHANGE_MUSIC_EVENT, handler)
