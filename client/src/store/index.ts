import {
  Player, 
  Music,
} from "../../../@types"

export interface Store {
  player?: Player
  notifications?: number
  music?: Music
}

export const store: Store = {
}
