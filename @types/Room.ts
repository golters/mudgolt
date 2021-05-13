import {
  Door, 
} from "./Door"
import {
  Item, 
} from "./Item"

export interface Room {
  id: number
  name: string
  banner: string
  description: string
  doors: Door[]
  keys: Item[]
  isProtected: boolean
}
