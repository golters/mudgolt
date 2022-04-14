import {
  GO_EVENT,
  LOOK_EVENT,
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
import {
  store,
} from "../store"

export const Go: CommandModule = {
  command: "go",
  syntax: "go [door name]",
  bio: "enter another room through one of the exits you can check with the /look command",

  callback ({ args }) {
    const [roomName] = args

    if (!roomName) {
      pushErrorToLog(`Syntax: ${Go.syntax}`)

      return
    }

    sendEvent(GO_EVENT, roomName.trim())
    sendEvent(LOOK_EVENT, store.player?.roomId)
  },
}
