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
  cost: "1 per changed character",
  bio: "add a description to an item, room or yourself that can be read through the /look command",

  callback({ args }) {
    sendEvent(ROOM_DESCRIBE_EVENT, args)
  },
}
