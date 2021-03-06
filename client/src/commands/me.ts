import {
  ME_EVENT,
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

export const Me: CommandModule = {
  command: "me",
  syntax: "me [action]",
  aliases: ["act", "rp"],
  bio: "describe an action you are performing it will appear after your name in the chat log",

  callback({ args }) {
    if(!args){      
      pushErrorToLog(`Syntax: ${Me.syntax}`)

      return
    }
    sendEvent(ME_EVENT, args.join(" "))
  },
}
