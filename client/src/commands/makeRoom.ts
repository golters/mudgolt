import { ROOM_COST } from "../../../constants"
import {
  MAKE_ROOM_EVENT,
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

export const MakeRoom: CommandModule = {
  command: "makeroom",
  syntax: "makeroom [room name]",
  bio: "make a new room, by default it has no doors leading to it so make one to get in or just teleport",
  cost: `${ROOM_COST}`,

  callback ({ args }) {
    const [name] = args

    if (!name) {
      pushErrorToLog(`Syntax: ${MakeRoom.syntax}`)

      return
    }

    sendEvent(MAKE_ROOM_EVENT, name.trim())
  },
}
