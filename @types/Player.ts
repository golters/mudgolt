import { Item } from "./Item"

export interface Player {
  id: number
  publicKey: string
  username: string
  location: number
  inventory: Item[]
  golts: number
}
