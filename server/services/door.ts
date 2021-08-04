import { Props } from "react"
import {
  Door,
} from "../../@types"
import {
  db,
} from "../store"

export const createDoor = async (roomID: number, targetID: number | undefined, name: string, props: Partial<Door> = {}): Promise<Door> => {
  const existingRoom = await db.get<Partial<Door>>(/*sql*/`
    SELECT id FROM rooms WHERE "room_id" = $1 AND ("target_room_id" = $2 OR "name" = $3)
  `, [roomID,targetID,name])

  if (existingRoom) {
    throw new Error("Door already exists")
  }

  await db.get(/*sql*/`
    INSERT INTO doors ("room_id", "target_room_id", "name")
      VALUES ($1, $2, $3);
  `, [
    roomID,
    targetID,
    name,
  ])

  const room = await getDoorByName(roomID, name) as Door

  return room
}

export const deleteDoor = async (roomID: number, name: string): Promise<void> => {
  await db.run(/*sql*/`
    DELETE FROM doors WHERE "room_id" = $1 AND "name" = $2;
  `, [
    roomID,
    name,
  ])
}

export const getDoorByName = async (roomID: number, name: string): Promise<Door | undefined> => {
  const door = await db.get<Door>(/*sql*/`
    SELECT * FROM doors WHERE "room_id" = $1 AND "name" = $2;
  `, [roomID, name])

  if (door === undefined) {
    throw new Error("door does not exist")		
  }
  
  return door
}

export const getDoorByRoom = async (roomId: number): Promise <Door[]> => {
  const doors = await db.all<Door[]>(/*sql*/`
    SELECT * FROM doors WHERE room_id = $1;
  `, [roomId])

  return doors
}
