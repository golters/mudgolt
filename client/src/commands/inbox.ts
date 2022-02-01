import {
  INBOX_EVENT,
} from "../../../events"
import {
  sendEvent, 
} from "../network"
import {
  CommandModule, 
} from "./emitter"
import {
  store,
} from "../store"

export const Inbox: CommandModule = {
  command: "inbox",
  syntax: "inbox",

  callback() {
    sendEvent(INBOX_EVENT, store.player?.id)
  },
}
