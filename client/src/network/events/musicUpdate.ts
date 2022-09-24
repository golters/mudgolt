import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  MUSIC_UPDATE_EVENT, 
} from "../../../../events"
import {
  iconUtil,
} from "../../utils/icon"
import {
  store,
} from "../../store"
import {
  Music,
} from "../../../../@types"

const handler: NetworkEventHandler = (music: Music) => {
  store.music = music
}

networkEmitter.on(MUSIC_UPDATE_EVENT, handler)
