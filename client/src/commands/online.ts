import {
  ONLINE_EVENT,
} from "../../../events"
import {
  sendEvent, 
} from "../network"
import {
  CommandModule, 
} from "./emitter"

export const Online: CommandModule = {
  command: "online",
  syntax: "online: for list of online users",


  callback() {
    sendEvent(ONLINE_EVENT, null)
  },
}
