import { Item } from "./Item"

export interface Player {
  id: number
  publicKey: string
  username: string
  room: number
  inventory: Item[]
  golts: number
}
