import { Item } from "./Item"

export interface Player {
  publicKey: string
  username: string
  location: number
  inventory: Item[]
  golts: number
}
