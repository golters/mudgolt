import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  ERROR_EVENT,
  GO_EVENT,
  ROOM_UPDATE_EVENT,
  SERVER_LOG_EVENT,
} from "../../../events"
import {
  sendEvent, 
} from "../../network"
import {
  setPlayerRoom, 
} from "../../services/player"
import {
  store, 
} from "../../store"

const handler: NetworkEventHandler = (socket, roomName: string, player) => {
  try {
    roomName = roomName.replace(/\s/g, '_')

    setPlayerRoom(player, roomName)

    sendEvent(socket, ROOM_UPDATE_EVENT, store.rooms[player.room])
    sendEvent(socket, SERVER_LOG_EVENT, `You've moved to ${roomName}`)
  } catch (error) {
    sendEvent(socket, ERROR_EVENT, error.message)
  }
}


networkEmitter.on(GO_EVENT, handler)
