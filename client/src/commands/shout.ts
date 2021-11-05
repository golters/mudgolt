import {
  SHOUT_EVENT,
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

export const Shout: CommandModule = {
  command: "shout",
  syntax: "shout [message]",

  callback({ input }) {
    let message = input
    message = message.substring(7)
    sendEvent(SHOUT_EVENT, message)
  },
}
