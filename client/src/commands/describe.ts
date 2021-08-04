import {
  ROOM_DESCRIBE_EVENT,
} from "../../../events"
import { pushErrorToLog } from "../components/Terminal"
import {
  sendEvent,
} from "../network"
import {
  ROOM_MAX_BIO,
} from "../../../constants"
import {
  CommandModule,
} from "./emitter"

export const Describe: CommandModule = {
  command: "describe",
  syntax: "describe [room description]",

  callback({ input }) {
    let bio = input
    bio = bio.substring(10)
    sendEvent(ROOM_DESCRIBE_EVENT, bio)
  },
}
