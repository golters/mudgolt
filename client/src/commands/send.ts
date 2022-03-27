import {
  SEND_EVENT,
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

export const Send: CommandModule = {
  command: "send",
  syntax: "send [item name] [player name]",
  aliases: ["deliver","mail","post"],

  callback({ args }) {
    if (args.length != 2) {
      pushErrorToLog(`Syntax: ${Send.syntax}`)

      return
    }

    sendEvent(SEND_EVENT, args)
  },
}
