import {
  MAKE_ROOM_EVENT,
} from "../../../events"
import {
  logError,
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

  callback ({ args }) {
    let [name] = args

    name = name?.trim()

    if (!name) {
      logError(`Syntax: ${MakeRoom.syntax}`)

      return
    }

    sendEvent(MAKE_ROOM_EVENT, name)
  },
}
