import { Player } from "./Player"
import { Item } from "./Item"
import { Door } from "./Door"

export interface Look {
  bio: string
  users: string[]
  items: Item[]
  doors: Door[]
  event: string

}
