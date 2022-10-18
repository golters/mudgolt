import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  BANNER_UPDATE_EVENT, 
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

const handler: NetworkEventHandler = (banner: string) => {
  changeBanner(banner)    
}

networkEmitter.on(BANNER_UPDATE_EVENT, handler)
