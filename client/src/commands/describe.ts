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
  syntax: "describe [me,room,item name] [description]",

  callback({ args }) {
    sendEvent(ROOM_DESCRIBE_EVENT, args)
  },
}
