import {
  NetworkEventHandler,
  networkEmitter,
} from "./emitter"
import {
  sendEvent,
} from "../"
import {
  TOOLBAR_UPDATE_EVENT,
  ERROR_EVENT,
  DOOR_UPDATE_EVENT,
  INVENTORY_UPDATE_EVENT,
  NPC_UPDATE_EVENT,
  INBOX_UPDATE_EVENT,
  CORRESPONDENTS_UPDATE_EVENT,
} from "../../../events"
import {
  getRoomById,
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
} from "../../network"
import { getInvByPlayer } from "../../services/player"
import { fetchCorrespondent, fetchInbox } from "../../services/chat"

const handler: NetworkEventHandler = async (socket, nothing: string, player) => {
  try {
    const doors = await getDoorByRoom(player.roomId)
    broadcastToUser<Door[]>(DOOR_UPDATE_EVENT, doors, player.username)
    const inv = await getInvByPlayer(player.id)
    broadcastToUser<Item[]>(INVENTORY_UPDATE_EVENT, inv, player.username)
    const npcs = await getLivingNpcs()
    broadcastToUser<Npc[]>(NPC_UPDATE_EVENT, npcs, player.username)
    const inbox = await fetchInbox(player.id, 20, null)
    broadcastToUser<Chat[]>(INBOX_UPDATE_EVENT, inbox, player.username)
    const correspondents = await fetchCorrespondent(player.id)
    broadcastToUser<string[]>(CORRESPONDENTS_UPDATE_EVENT, correspondents, player.username)

  }catch(error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
    console.error(error)
  }
}

networkEmitter.on(TOOLBAR_UPDATE_EVENT, handler)
