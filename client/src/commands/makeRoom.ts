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
  command: "make room",
  syntax: "make room [room name]",

  callback ({ args }) {
    let [name] = args

    name = name?.trim()

    if (!name) {
      pushErrorToLog(`Syntax: ${MakeRoom.syntax}`)

      return
    }

    sendEvent(MAKE_ROOM_EVENT, name)
  },
}
