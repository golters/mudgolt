import {
  store, 
} from "../store"
import {
  createRoom,
} from "./room"

export const initStore = async () => {
  if (!store.players) store.players = []
  if (!store.rooms) store.rooms = []
  if (!store.chats) store.chats = {}
  
  if (store.rooms.length === 0) {
    createRoom("golt-hq", {
      isProtected: true,
      description: "The headquarters of the Friends of the Golt.",
    })
  }
}
