import { Room } from "../../@types"
import { saveStore, store } from "../store"
import { BANNER_WIDTH, BANNER_HEIGHT, BANNER_FILL } from "../../constants"

export const generateBanner = () => {
  return new Array(BANNER_WIDTH * BANNER_HEIGHT).fill(BANNER_FILL).join("")
}

export const createRoom = (name: string, props: Partial<Room> = {}) => {
  if (store.rooms.some(room => room.name === name)) {
    throw "Room name taken."
  }

  const room: Room = Object.assign({
    id: store.rooms.length,
    name: name,
    banner: generateBanner(),
    description: "",
    doors: [],
    keys: [],
    isProtected: false,
  }, props)

  store.rooms.push(room)

  saveStore()

  return room
}
