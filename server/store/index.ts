import {
  Player, Room, 
} from "../../@types"
import fs from "fs"
import path from "path"

const db = path.join(__dirname, "../../db")
const storeFile = path.join(db, "store.json") 

if (!fs.existsSync(db)) fs.mkdirSync(db)

export interface Store {
  players: Player[]
  rooms: Room[]
}

const defaultStore: Store = {
  players: [],
  rooms: [],
}

export const store: Store = Object.assign(
  defaultStore,

  fs.existsSync(storeFile) 
    ? JSON.parse(fs.readFileSync(storeFile, "utf8"))
    : defaultStore,
)

/**
 * Save storage to JSON file. Use this after every modification.
 */
export const saveStore = () => {
  fs.writeFile(
    storeFile,
    JSON.stringify(store),
    "utf8", 
    error => error && console.error(error),
  )
}

import("../services/room").then(({ createRoom }) => {
  if (store.rooms.length === 0) {
    createRoom("golt-hq", {
      isProtected: true,
      description: "The headquarters of the Friends of the Golt.",
    })
  }
}).catch(console.error)

saveStore()
