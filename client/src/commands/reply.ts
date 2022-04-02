import {
  REPLY_EVENT,
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

export const Reply: CommandModule = {
  command: "reply",
  syntax: "reply [message]",

  callback({ args }) {
    if(!args){      
      pushErrorToLog(`Syntax: ${Reply.syntax}`)

      return
    }
    
    sendEvent(REPLY_EVENT, args)
  },
}
