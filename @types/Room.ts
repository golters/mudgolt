import { Door } from "./Door"

export interface Room {
  id: number
  name: string
  banner: string
  description: string
  doors: Door[]
  keys: []
  isProtected: boolean
}
