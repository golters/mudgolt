import {
  TP_EVENT,
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

export const Tp: CommandModule = {
  command: "tp",
  syntax: "tp [room name]",
  aliases: ["teleport"],

  callback({ args }) {
    const [roomName] = args

    if (!roomName) {
      pushErrorToLog(`Syntax: ${Tp.syntax}`)

      return
    }

    sendEvent(TP_EVENT, roomName.trim())
  },
}
