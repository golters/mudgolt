import { Room } from "../../@types"
import { saveStore, store } from "../store"

export const createRoom = (name: string, isProtected: boolean) => {
  if (store.rooms.some(room => room.name === name)) {
    throw "Room name taken."
  }

  const room: Room = {
    id: store.rooms.length,
    name: name,
    banner: "",
    description: "",
    doors: [],
    keys: [],
    isProtected,
  }

  store.rooms.push(room)

  saveStore()

  return room
}
