/* eslint-disable camelcase */
import {
  Door,
} from "../../@types"
import {
  db,
} from "../store"

export const createDoor = async (roomID: number, targetID: number | undefined, name: string): Promise<Door> => {
  const existingDoor = await db.get<Door>(/*sql*/`
    SELECT * FROM doors 
    WHERE "room_id" = $1 
    AND ("target_room_id" = $2
    OR "name" = $3)
  `, [roomID,targetID,name])

  if (existingDoor) {
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

  // FIXME: this is an unnecessary query
  return await getDoorByName(roomID, name)
}

export const deleteDoor = async (roomID: number, name: string): Promise<void> => {
  await db.run(/*sql*/`
    DELETE FROM doors WHERE "room_id" = $1 AND "name" = $2;
  `, [
    roomID,
    name,
  ])
}

export const getDoorByName = async (roomID: number, name: string): Promise<Door> => {
  const door = await db.get<Door>(/*sql*/`
    SELECT * FROM doors WHERE "room_id" = $1 AND "name" = $2;
  `, [roomID, name])

  if (door === undefined) {
    throw new Error("door does not exist")		
  }
  
  return door
}

export const getDoorByRoom = async (roomId: number): Promise<Door[]> => {
  const doors = await db.all<Door[]>(/*sql*/`
    SELECT * FROM doors WHERE room_id = $1;
  `, [roomId])

  return doors
}

export const getDoorsIntoRoom = async (roomId: number): Promise<Door[]> => {
  const doors = await db.all<Door[]>(/*sql*/`
    SELECT * FROM doors WHERE target_room_id = $1;
  `, [roomId])

  return doors
}

export const getTargetDoor = async (roomId: number, doorName: string): Promise<Door> => {
  const targetDoor = await db.get<Door>(/*sql*/`
    SELECT target_room_id FROM doors WHERE "room_id" = $1 AND "name" = $2;
  `, [roomId, doorName])

  if (!targetDoor) {
    throw new Error("Door doesn't exist")
  }

  return targetDoor
}
