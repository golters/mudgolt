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
    sendEvent(WHISPER_EVENT, input)
  },
}
