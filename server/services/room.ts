import {
  Room, 
} from "../../@types"
import {
  db,
} from "../store"
import {
  BANNER_WIDTH, BANNER_HEIGHT, BANNER_FILL, 
} from "../../constants"

export const generateBanner = () => {
  return new Array(BANNER_WIDTH * BANNER_HEIGHT)
    .fill(BANNER_FILL)
    .join("")
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
