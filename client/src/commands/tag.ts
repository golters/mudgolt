import {
  TAG_ITEM_EVENT,
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

export const Tag: CommandModule = {
  command: "tag",
  syntax: "tag [item] [tag,tag,tag...]",
  bio: "change tags on items for easier sorting",

  callback({ args }) {
    sendEvent(TAG_ITEM_EVENT, args)
  },
}
