import {
  LINK_EVENT, LOG_EVENT,
} from "../../../events"
import { pushErrorToLog } from "../components/Terminal"
import {
  sendEvent,
} from "../network"
import {
  CommandModule,
} from "./emitter"

export const Link: CommandModule = {
  command: "link",
  syntax: "link",
  bio: "get an invite link for your current room",

  callback() {
    sendEvent(LINK_EVENT, null)
  },
}
