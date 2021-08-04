import {
  DELETE_DOOR_EVENT,
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

export const DeleteDoor: CommandModule = {
  command: "deletedoor",
  syntax: "deletedoor [door name]",

  callback({ args }) {
    const [door] = args

    if (!door) {
      pushErrorToLog(`Syntax: ${DeleteDoor.syntax}`)

      return
    }

    sendEvent(DELETE_DOOR_EVENT, [door.trim()])
  },
}
