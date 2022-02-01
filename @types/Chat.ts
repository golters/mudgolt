import { Player } from "./Player"

export interface Chat {
  player: Partial<Player>
  message: string
  date: number
  recipiant: Partial<Player> | null
}

export interface ChatHistory {
  roomId: boolean | null
  fromPlayerId: number
  toPlayerId: number | null
  message: string
  date: number
}
