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
  bio: "send a message in all caps to all the surrounding rooms",

  callback({ args }) {
    if(!args){      
      pushErrorToLog(`Syntax: ${Shout.syntax}`)

      return
    }    
    sendEvent(SHOUT_EVENT, args.join(" "))
  },
}
