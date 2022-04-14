import {
  TP_EVENT,
} from "../../../events"
import {
  pushErrorToLog,
} from "../components/Terminal"
import {
  sendEvent,
} from "../network"
import {
  CommandModule,
} from "./emitter"
import {
  store,
} from "../store"
import { TELEPORT_COST } from "../../../constants"

export const Tp: CommandModule = {
  command: "tp",
  syntax: "teleport [room name]",
  aliases: ["teleport", "warp", "portal", "jump"],
  cost: `${TELEPORT_COST}`,
  bio: "warp to another room without having a door leading directly to it",

  callback({ args }) {
    const [roomName] = args

    if (!roomName) {
      pushErrorToLog(`Syntax: ${Tp.syntax}`)

      return
    }

    sendEvent(TP_EVENT, roomName.trim())
  },
}
