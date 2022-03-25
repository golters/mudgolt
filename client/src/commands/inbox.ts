import {
  INBOX_EVENT,
} from "../../../events"
import {
  sendEvent, 
} from "../network"
import { pushErrorToLog } from "../components/Terminal"
import {
  CommandModule, 
} from "./emitter"
import {
  store,
} from "../store"

export const Inbox: CommandModule = {
  command: "inbox",
  syntax: "inbox or inbox [username]",

  callback({ args }) {
    if(args.length > 1){  
      pushErrorToLog(`Syntax: ${Inbox.syntax}`)

      return
    }
    sendEvent(INBOX_EVENT, args)
  },
}
