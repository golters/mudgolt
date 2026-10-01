import type { Player } from "./Player.ts"
import type { Item } from "./Item.ts"
import type { Door } from "./Door.ts"

export interface Look {
  bio: string
  users: string[]
  items: Item[]
  doors: Door[]
  event: string

}
