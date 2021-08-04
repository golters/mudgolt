import {
  Room, 
} from "../../@types"
import {
  db,
} from "../store"
import {
  BANNER_WIDTH, BANNER_HEIGHT, BANNER_FILL, 
} from "../../constants"
import {
  ROOM_UPDATE_EVENT,
} from "../../events"
import {
  broadcastToRoom,
} from "../network"

export const generateBanner = () => {
  return new Array(BANNER_WIDTH * BANNER_HEIGHT)
    .fill(BANNER_FILL)
    .join("")
}

export const editBaner = async (x: string, y: string, char: string, room: Room | undefined): Promise<Room | undefined> => {
  const pos = (Number(x)-1) + ((Number(y)- 1) * 96)
  if (!room) {
    throw new Error("Room doesn't exist")
  }
  const newBanner1 = room?.banner.substring(0, pos)
  const newBanner2 = room?.banner.substring(pos + 1)
  const newbanner = newBanner1 + char + newBanner2

  await db.run(/*sql*/`
    UPDATE rooms
      SET banner = $1
      WHERE id = $2;
  `, [newbanner, room?.id])
	
  if (room === undefined) {
    throw new Error("Room doesn't exist")
  }
  broadcastToRoom<Room>(ROOM_UPDATE_EVENT, room, room?.id)

  return room
}

export const editBio = async (bio: string, room: Room | undefined): Promise<Room | undefined> => {
  await db.run(/*sql*/`
    UPDATE rooms
      SET description = $1
      WHERE id = $2;
  `, [bio, room?.id])

  if (room === undefined) {
    throw new Error("Room doesn't exist")
  }
  broadcastToRoom<Room>(ROOM_UPDATE_EVENT, room, room?.id)
  
  return room
}

export const createRoom = async (name: string, props: Partial<Room> = {}): Promise<Room> => {
  const existingRoom = await db.get<Partial<Room>>(/*sql*/`
    SELECT id FROM rooms WHERE "name" = $1
  `, [name])

  if (existingRoom) {
    throw new Error("Room name taken.")
  }

  await db.get(/*sql*/`
    INSERT INTO rooms ("name", "banner", "description", "isProtected")
      VALUES ($1, $2, $3, $4);
  `, [
    name, 
    props.banner || generateBanner(), 
    props.description || "",
    props.isProtected || false,
  ])

  const room = await getRoomByName(name) as Room

  return room
}

export const getRoomById = async (id: number): Promise<Room | undefined> => {
  const room = await db.get<Room>(/*sql*/`
    SELECT * FROM rooms WHERE id = $1
  `, [id])

  return room
}

export const getRoomByName = async (name: string): Promise<Room | undefined> => {
  const room = await db.get<Room>(/*sql*/`
    SELECT * FROM rooms WHERE "name" = $1;
  `, [name])

  return room
}
