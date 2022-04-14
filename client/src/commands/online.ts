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
  bio: "get a list of everyone who is currently online or was online in the last 24 hours",


  callback() {
    sendEvent(ONLINE_EVENT, null)
  },
}
