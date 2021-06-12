import {
  GO_EVENT,
} from "../../../events"
import {
  logError,
} from "../components/Terminal"
import {
  sendEvent, 
} from "../network"
import {
  CommandModule, 
} from "./emitter"

export const Go: CommandModule = {
  command: "go",
  syntax: "go [room name]",

  callback ({ args }) {
    let [roomName] = args

    roomName = roomName?.trim()

    if (!roomName) {
      logError(`Syntax: ${Go.syntax}`)

      return
    }

    sendEvent(GO_EVENT, roomName)
  },
}
