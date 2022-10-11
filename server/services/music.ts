import {
  Room, 
  Music,
} from "../../@types"
import {
  db,
} from "../store"
import {
  BANNER_WIDTH, BANNER_HEIGHT, BANNER_FILL, 
} from "../../constants"
import {
  CHANGE_MUSIC_EVENT,
  ROOM_UPDATE_EVENT,
} from "../../events"
import {
  broadcastToRoom,
} from "../network"
import {
  getRoomById,
} from "./room"

export const generateMusic = () => {
  return new Array(BANNER_WIDTH * BANNER_HEIGHT)
    .fill(BANNER_FILL)
    .join("")
}

export const createMusic = async (roomID: number, props: Partial<Music> = {}): Promise<Music> => {
  const existingMusic = await db.get<Partial<Music>>(/*sql*/`
    SELECT id FROM music WHERE "room_id" = $1
  `, [roomID])

  if (existingMusic) {
    throw new Error("Room already has music")
  }

  await db.get(/*sql*/`
    INSERT INTO music ("room_id", "banner")
      VALUES ($1, $2);
  `, [
    roomID, 
    props.banner || generateMusic(),
  ])

  const music = await getMusicByRoom(roomID)

  if (music === undefined) {
    throw new Error("music doesn't exist")
  }

  return music
}

export const getMusicByRoom = async (roomId: number): Promise<Music | undefined> => {
  const music = await db.get<Music>(/*sql*/`
    SELECT * FROM music WHERE room_id = $1
  `, [roomId])

  if (music === undefined) {
    //throw new Error("Room doesn't exist")
  }

  return music
}

export const editMusic = async (x: number, y: number, character: string, room: Room): Promise<Music> => {
  const pos = x + (y * BANNER_WIDTH)
  
  if (room === undefined) {
    throw new Error("Room doesn't exist")
  }
  const music = await getMusicByRoom(room.id)
  if(music === undefined){
    throw new Error("music doesn't exist")
  }

  const banner = music.banner.split("")

  banner[pos] = character

  music.banner = banner.join("")
  

  await db.run(/*sql*/`
    UPDATE music
      SET banner = $1
      WHERE room_id = $2;
  `, [music.banner, room.id])

  //broadcastToRoom<Room>(CHANGE_MUSIC_EVENT, room, room.id)
  broadcastToRoom<Room>(ROOM_UPDATE_EVENT, room, room.id)

  return music
}

export const updateRoomMusic = async (roomId: number): Promise<Music> => {
  const room = getRoomById(roomId)
  if(room === undefined){
    throw new Error("room does not exist")
  }
  const music = await db.get<Music>(/*sql*/`
    SELECT * FROM music WHERE id = $1
  `, [roomId])
  if(music === undefined){
    const newMusic = createMusic(roomId)

    return newMusic
  } 

  return music
}

export const getMusicById = async (id: number): Promise<Music> => {
  const music = await db.get<Music>(/*sql*/`
    SELECT * FROM music WHERE id = $1
  `, [id])

  if (music === undefined) {
    throw new Error("Music doesn't exist")
  }

  return music
}
