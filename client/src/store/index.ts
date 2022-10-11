import {
  Player, 
  Music,
  Game,
} from "../../../@types"

export interface Store {
  player?: Player
  notifications?: number
  music?: Music
  game?: Game
}

export const store: Store = {
}
