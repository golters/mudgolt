import {
  GO_EVENT,
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

export const Go: CommandModule = {
  command: "go",
  syntax: "go [door name]",

  callback ({ args }) {
    const [roomName] = args

    if (!roomName) {
      pushErrorToLog(`Syntax: ${Go.syntax}`)

      return
    }

    sendEvent(GO_EVENT, roomName.trim())
  },
}
