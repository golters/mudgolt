import { DOOR_COST, DOOR_MULTIPLIER, GOLT } from "../../../constants"
import {
  MAKE_EVENT,
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

export const Make: CommandModule = {
  command: "make",
  syntax: "make [door/room/item] [name] [destination room(door)]",
  bio: "Make an item, door or room",
  cost: "",

  callback({ args }) {
    const [type, name, room] = args

    if (!name || !type) {
      pushErrorToLog(`Syntax: ${Make.syntax}`)

      return
    }

    sendEvent(MAKE_EVENT, [type, name.trim(), room])
  },
}
