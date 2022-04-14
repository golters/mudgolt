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
  bio: "check the whispers between you and other users, follow /inbox with a specific username to narrow down only the whispers between you and that user",

  callback({ args }) {
    if(args.length > 1){  
      pushErrorToLog(`Syntax: ${Inbox.syntax}`)

      return
    }
    sendEvent(INBOX_EVENT, args)
  },
}
