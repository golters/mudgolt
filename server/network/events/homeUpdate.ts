import {
  type NetworkEventHandler,
  networkEmitter,
} from "./emitter.ts"
import {
  sendEvent,
} from "../index.ts"
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
} from "../../../events.ts"
import {
  activeRooms,
  getRoomById,
  randomRooms,
} from "../../services/room.ts"
import {
  getDoorByRoom,
} from "../../services/door.ts"
import {
  getLivingNpcs,
} from "../../services/npc.ts"
import type {
  Room,
  Door,
  Item,
  Npc,
  Chat,
} from "../../../@types/index.ts"
import {
  broadcastToUser,
} from "../index.ts"

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
