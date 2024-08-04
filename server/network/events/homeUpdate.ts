import {
  NetworkEventHandler,
  networkEmitter,
} from "./emitter"
import {
  sendEvent,
} from ".."
import {
  ERROR_EVENT,
  DOOR_UPDATE_EVENT,
  INVENTORY_UPDATE_EVENT,
  NPC_UPDATE_EVENT,
  INBOX_UPDATE_EVENT,
  CORRESPONDENTS_UPDATE_EVENT,
  ACTIVE_UPDATE_EVENT,
  HOME_UPDATE_EVENT,
  RANDOM_ROOM_EVENT,
} from "../../../events"
import {
  activeRooms,
  getRoomById,
  randomRooms,
} from "../../services/room"
import {
  getDoorByRoom,
} from "../../services/door"
import {
  getLivingNpcs,
} from "../../services/npc"
import {
  Room,
  Door,
  Item,
  Npc,
  Chat,
} from "../../../@types"
import {
  broadcastToUser,
} from ".."

const handler: NetworkEventHandler = async (socket, nothing: string, player) => {
  try {
    const recentRoomNames = await activeRooms()
    broadcastToUser<Room[]>(ACTIVE_UPDATE_EVENT, recentRoomNames, player.username)
    const randomRoomNames = await randomRooms()
    broadcastToUser<Room[]>(RANDOM_ROOM_EVENT, randomRoomNames, player.username)

  }catch(error) {
    sendEvent<string>(socket, ERROR_EVENT, (error as any).message)
    console.error(error)
  }
}

networkEmitter.on(HOME_UPDATE_EVENT, handler)
