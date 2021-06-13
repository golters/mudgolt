import {
  Chat,
  Player, 
  Room, 
} from "../../@types"
import fs from "fs"
import path from "path"
import { initStore } from "../services/init"

const db = path.join(__dirname, "../../db")
const storeFile = path.join(db, "store.json") 

if (!fs.existsSync(db)) fs.mkdirSync(db)

export interface Store {
  players: Player[]
  rooms: Room[]
  chats: {
    [roomId: string]: Chat[]
  }
}

const defaultStore: Store = {} as Store

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

export const storeTask = async () => {
  await initStore()
  saveStore()
}
