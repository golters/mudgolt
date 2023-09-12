import {
  Room, 
  Event,
  EventTag,
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
import {
  online,
} from "../network"
import {
  getDoorByRoom,
} from "./door"
import {
  getItemByRoom,
} from "./item"
import { getAllBearNames, getBearName, getCurrentEvent, getZombieDoors, getZombieRooms } from "./event"

export const generateBanner = () => {
  return new Array(BANNER_WIDTH * BANNER_HEIGHT)
    .fill(BANNER_FILL)
    .join("")
}

export const editBaner = async (x: number, y: number, character: string, room: Room): Promise<Room> => {
  const pos = x + (y * BANNER_WIDTH)

  const banner = Array.from(room.banner);

  banner[pos] = character

  room.banner = banner.join("")

  await db.run(/*sql*/`
    UPDATE rooms
      SET banner = $1
      WHERE id = $2;
  `, [room.banner, room.id])

  broadcastToRoom<Room>(ROOM_UPDATE_EVENT, room, room.id)

  return room
}

export const editBio = async (bio: string, room: Room): Promise<Room> => {
  await db.run(/*sql*/`
    UPDATE rooms
      SET description = $1
      WHERE id = $2;
  `, [bio, room.id])

  if (room === undefined) {
    throw new Error("Room doesn't exist")
  }

  broadcastToRoom<Room>(ROOM_UPDATE_EVENT, room, room.id)
  
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

  const room = await getRoomByName(name)

  if (room === undefined) {
    throw new Error("Room doesn't exist")
  }

  return room
}

export const getRoomById = async (id: number): Promise<Room> => {
  const room = await db.get<Room>(/*sql*/`
    SELECT * FROM rooms WHERE id = $1
  `, [id])

  if (room === undefined) {
    throw new Error("Room doesn't exist")
  }

  return room
}

export const getAllRooms = async (): Promise<Room[]> => {
  const rooms = await db.all<Room[]>(/*sql*/`
    SELECT * FROM rooms;
  `,[])

  return rooms
}

export const getRoomByName = async (name: string): Promise<Room> => {
  const room = await db.get<Room>(/*sql*/`
    SELECT * FROM rooms WHERE "name" = $1;
  `, [name])

  if (room === undefined) {
    throw new Error("Room doesn't exist")
  }

  return room
}

export const lookByID = async (id: number): Promise<string> => {
  const room = await getRoomById(id)

  let message = `${room.description}\nyou see`
  const event = await getCurrentEvent(Date.now())

  if(event?.type === "Bear_Week"){
    for (let i = 0; i < online.length; i++){   
      if (online[i].player.roomId == room.id) { 
        const bearTag = await getBearName(event?.id, online[i].player.id)
        message = `${message} ${bearTag}`
      }
    }
  }else{
    online.forEach(({ player }) => {
      if (player.roomId == room.id) {
        message = `${message} ${player.username}`
      }
    })
  }

  const doors = await getDoorByRoom(id)
  const names = doors.map(x => x.name);
  const items = await getItemByRoom(id)
  const itemnames = items.map(x => x.name);

  if(!items){
    throw new Error("items null")
  }

  if (items.length > 0) {
    message = `${message}\non the floor is a ${itemnames}`
  } else {
    const dateObj = new Date();
    const myDate = ((dateObj.getMonth() + 1)+ "/" + (dateObj.getUTCDate()));
    if(myDate === "11/08"){
      message = `${message}\nthe floor is bear`
    }else{
      message = `${message}\nthe floor is bare`
    }
  }  

  if (!doors) {
    throw new Error("doors null")
  }

  if (doors.length > 0) {
    message = `${message}\nthe exits are: /go ${names}`
  } else {
    message = `${message}\nthere are no exits`
  }  

  if(event && event.type === "Zombie_Invasion") {
    const zombies = await getZombieDoors(id, event.id)
    const zroom = await getZombieRooms(event.id)
    const zroomid = zroom.map(x => x.id)
    if(zroomid.includes(id)){
      message = `${message}\nthis room is crawling with zombies`
    }else
    if(zombies.length > 0){
      const znames = zombies.map(x => x.name);
      message = `${message}\nzombies are trying to get in through ${znames}`
    }else {
      message = `${message}\nthere are no zombies trying to get in... yet`
    }
  }


  return message
}
