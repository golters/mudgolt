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

  callback({ input }) {
    if(!input){      
      pushErrorToLog(`Syntax: ${Whisper.syntax}`)

      return
    }
    sendEvent(WHISPER_EVENT, input)
  },
}
