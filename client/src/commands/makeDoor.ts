import { DOOR_COST, DOOR_MULTIPLIER, GOLT } from "../../../constants"
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
  bio: "create an exit from this room to another, the cost depends on how many doors are already in this room",
  cost: `${DOOR_COST} + (${DOOR_COST} x ${DOOR_MULTIPLIER} x the amount of doors already in the room) + 1 ${GOLT} per character`,

  callback({ args }) {
    const [name, room] = args

    if (!name) {
      pushErrorToLog(`Syntax: ${MakeDoor.syntax}`)

      return
    }

    sendEvent(MAKE_DOOR_EVENT, [name.trim(), room])
  },
}
