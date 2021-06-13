import { Player } from "./Player"

export interface Chat {
  player: Partial<Player>
  message: string
}
