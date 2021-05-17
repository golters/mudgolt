import {
  LOG_EVENT, MAKE_ROOM_EVENT,
} from "../../../events"
import {
  LogItem, 
} from "../components/terminal"
import {
  sendEvent, 
} from "../network"
import {
  commandEmitter, CommandModule, 
} from "./emitter"

export const MakeRoom: CommandModule = {
  command: "make room",

  callback ({ args }) {
    const [name] = args

    if (!name) {
      const errorItem = LogItem(`Syntax: make room [name]`)
      errorItem.classList.toggle("error-message")

      commandEmitter.emit(LOG_EVENT, errorItem)

      return
    }

    sendEvent(MAKE_ROOM_EVENT, name)
  },
}
