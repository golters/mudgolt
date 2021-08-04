import {
  MAKE_DOOR_EVENT,
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

export const MakeDoor: CommandModule = {
  command: "makedoor",
  syntax: "makedoor [door name] [destination room]",

  callback({ args }) {
    const [name, room] = args

    if (!name) {
      pushErrorToLog(`Syntax: ${MakeDoor.syntax}`)

      return
    }

    sendEvent(MAKE_DOOR_EVENT, [name.trim(), room])
  },
}
