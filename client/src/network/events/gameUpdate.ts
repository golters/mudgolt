import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  GAME_UPDATE_EVENT, 
} from "../../../../events"
import {
  iconUtil,
} from "../../utils/icon"
import {
  store,
} from "../../store"
import {
  Game,
} from "../../../../@types"
import { changeBanner } from "../../components/Header"

const handler: NetworkEventHandler = (game: Game) => {
  store.game = game
  changeBanner("game")    
}

networkEmitter.on(GAME_UPDATE_EVENT, handler)
