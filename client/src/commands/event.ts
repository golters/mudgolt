import {
  EVENT_EVENT,
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

export const Event: CommandModule = {
  command: "event",
  syntax: "",
  bio: "event specific commands",
  aliases: ["fish","bite","campaign","vote","poll","cheat"],

  //check correct amount of args
  callback({ args , input }) {
    if(!args){      
      //pushErrorToLog(`Syntax: ${Event.syntax}`)

      //return
    }
    
    sendEvent(EVENT_EVENT, input)
  },
}
