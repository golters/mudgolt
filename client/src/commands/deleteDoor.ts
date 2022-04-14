import { DELETE_DOOR_COST } from "../../../constants"
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
  bio: "remove a door from the room",
  cost: `${DELETE_DOOR_COST}`,

  callback({ args }) {
    const [door] = args

    if (!door) {
      pushErrorToLog(`Syntax: ${DeleteDoor.syntax}`)

      return
    }

    sendEvent(DELETE_DOOR_EVENT, [door.trim()])
  },
}
