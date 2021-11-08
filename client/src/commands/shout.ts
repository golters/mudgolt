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

  callback({ args }) {
    if(!args){      
      pushErrorToLog(`Syntax: ${Shout.syntax}`)

      return
    }    
    sendEvent(SHOUT_EVENT, args.join(" "))
  },
}
