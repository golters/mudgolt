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
  broadcastToRoom,
  sendEvent, 
} from "../../network"
import {
  setPlayerRoom, 
} from "../../services/player"
import {
  getRoom,
} from "../../services/room"
import {
  store, 
} from "../../store"

const handler: NetworkEventHandler = (socket, roomName: string, player) => {
  const oldRoom = getRoom(player.room)

  if (oldRoom.name === roomName) {
    return
  }
  
  try {
    roomName = roomName.replace(/\s/g, '_')

    setPlayerRoom(player, roomName)

    broadcastToRoom(ROOM_UPDATE_EVENT, oldRoom, oldRoom.id)
    broadcastToRoom(SERVER_LOG_EVENT, `${player.username} has left ${oldRoom.name}`, oldRoom.id)
    broadcastToRoom(ROOM_UPDATE_EVENT, store.rooms[player.room], player.room)
    broadcastToRoom(SERVER_LOG_EVENT, `${player.username} has joined ${roomName}`, player.room)
  } catch (error) {
    sendEvent(socket, ERROR_EVENT, error.message)
  }
}

networkEmitter.on(GO_EVENT, handler)
