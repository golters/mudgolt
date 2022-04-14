import {
  WHISPER_EVENT,
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

export const Whisper: CommandModule = {
  command: "whisper",
  syntax: "whisper [user] [message]",
  aliases: ["dm", "pm"],
  bio: "send a private message to a user, they do not need to be in the same room. check all whispers sent to and from you using /inbox",

  callback({ args }) {
    if(!args){      
      pushErrorToLog(`Syntax: ${Whisper.syntax}`)

      return
    }
    
    sendEvent(WHISPER_EVENT, args)
  },
}
