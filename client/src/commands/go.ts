import {
  GO_EVENT,
  LOG_EVENT,
} from "../../../events"
import {
  LogItem, 
} from "../components/terminal"
import {
  sendEvent, 
} from "../network"
import {
  commandEmitter, 
  CommandModule, 
} from "./emitter"

export const Go: CommandModule = {
  command: "go",

  callback ({ args }) {
    const [roomName] = args

    if (!roomName) {
      const errorItem = LogItem(`Syntax: go [room name]`)
      errorItem.classList.toggle("error-message")

      commandEmitter.emit(LOG_EVENT, errorItem)

      return
    }

    sendEvent(GO_EVENT, roomName)
  },
}
