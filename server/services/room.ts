import {
  Room, 
  Event,
  EventTag,
  Chat,
  ChatHistory,
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
  createFloorItem,
  createItem,
  getItemByRoom,
  setItemBio,
} from "./item"
import { getAllBearNames, getBearName, getCurrentEvent, getZombieDoors, getZombieRooms } from "./event"
import { fetchRoomChats } from "./chat"

export interface itemtypes {
  name: string
  bio: string
}

const bugs: itemtypes[] = [
  {
    name:"bug",
    bio:"bug",
  },{
    name:"roach",
    bio:"bug",
  },{
    name:"mantis",
    bio:"bug",
  },{
    name:"slug",
    bio:"bug",
  },{
    name:"snail",
    bio:"bug",
  },{
    name:"worm",
    bio:"bug",
  },{
    name:"butterfly",
    bio:"bug",
  },{
    name:"spider",
    bio:"bug",
  },
]

const weeds: itemtypes[] = [
  {
    name:"weed",
    bio:"a tenacious little plant that seems to be able to grow anywhere",
  },{
    name:"thistle",
    bio:"a sharp prickly stem holding up a purple firework like flower",
  },{
    name:"daisy",
    bio:"a cut little white flower",
  },{
    name:"clover",
    bio:"a tiny three leafed plant",
  },{
    name:"clover",
    bio:"a tiny four leafed plant, lucky you",
  },{
    name:"grass",
    bio:"a small green pointy plant",
  },{
    name:"dandelion",
    bio:"a fluffy plant that drops little floaty seeds everywhere, make a wish",
  },{
    name:"garlic",
    bio:"a bouquet of tiny white flowers sprouting from the ground, perhaps a tasty treat lies beneath",
  },{
    name:"carrot",
    bio:"a tight bunch of white flowers sprouting from a crunchy wild carrot",
  },{
    name:"mushroom",
    bio:"a white rubbery cap, maybe it's edible, might be poisonous",
  },{
    name:"lichen",
    bio:"a network of microscopic plants forming a crusty goop",
  },{
    name:"moss",
    bio:"a tightly woven clump of tiny grass like plants",
  },{
    name:"flower",
    bio:"a pretty flower",
  },{
    name:"bamboo",
    bio:"a tall hard wood like stick",
  },{
    name:"reeds",
    bio:"very tall grass, tall enough to hide in",
  },{
    name:"nettle",
    bio:"a fuzzy looking plant thats sharp and stings",
  },{
    name:"cactus",
    bio:"rows of spikes protect a juicy green plant",
  },{
    name:"succulent",
    bio:"it looks like a flower but it's green and juicy like a fruit",
  },{
    name:"orchid",
    bio:"a beautiful delicate flower",
  },{
    name:"ivy",
    bio:"spirals of wirey plant vines covered in three pointed leafs",
  },{
    name:"vines",
    bio:"ropey plant fibers that crawl along the ground",
  },{
    name:"bell",
    bio:"a delicate flower with bell shaped petals",
  },{
    name:"acorn",
    bio:"a small hardy seed with a bumpy hat",
  },{
    name:"pinecone",
    bio:"an intricate spiral of wooden tongues",
  },{
    name:"nightshade",
    bio:"a deadly poisonous plant with black berries and star shaped leaves",
  },{
    name:"bean",
    bio:"a long pod of beans, good for your heart, the more you eat the more you fart",
  },{
    name:"nut",
    bio:"a spikey green ball",
  },{
    name:"drosera",
    bio:"a sticky carnivorous plant",
  },{
    name:"lotus",
    bio:"a pink mandala shaped water flower",
  },{
    name:"hibiscus",
    bio:"a beautiful spiral flower with a long polen coated antena",
  },{
    name:"rafflesia",
    bio:"weed",
  },{
    name:"truffle",
    bio:"weed",
  },{
    name:"bramble",
    bio:"weed",
  },{
    name:"shrubbery",
    bio:"weed",
  },
]

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

export const roomName = async (room: string): Promise<string> => {  
  let areaNameNum = 0
  const roomarray = room.split(/(?:-|_| )+/)
  if(roomarray.length > 1){
    for(let i = 0; i < roomarray.length; i++){
      if(Number.isNaN(roomarray[i])){
        delete roomarray[i]
      }
      if(roomarray[i].length === 1){
        delete roomarray[i]
      }
      if(roomarray[i] === "left" || roomarray[i] === "right"
      || roomarray[i] === "north"|| roomarray[i] === "east"|| roomarray[i] === "south"|| roomarray[i] === "west"){
        delete roomarray[i]
      }
    }
    //add floor
    areaNameNum = Math.floor(Math.random() * (roomarray.length))
  }
  const areaName = roomarray[areaNameNum]

  return areaName
}


export const weedCheck = async (room: Room) => {
  const lastChats = await fetchRoomChats(room.id,1)

  if(!lastChats || lastChats.length < 1){

    return
  }

  if(lastChats[0].date > Date.now() - 1.728e+8){

    return
  }


  const roomItems = await getItemByRoom(room.id)
  if(roomItems.length < 1){
    if(Math.random() > 0.5){
      const bugtype = Math.floor(Math.random() * (bugs.length))
      const roomname = await roomName(room.name)
      const bug = await createFloorItem(room.id, roomname + "_" + bugs[bugtype].name)
      await setItemBio(bug.id, bugs[bugtype].bio)
    }else{
      const weedtype = Math.floor(Math.random() * (weeds.length))
      const roomname = await roomName(room.name)
      const weed = await createFloorItem(room.id, roomname + "_" + weeds[weedtype].name)
      await setItemBio(weed.id, weeds[weedtype].bio)
    }
  }

  return
}
