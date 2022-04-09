import {
  PAY_USER_EVENT,
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

export const Pay: CommandModule = {
  command: "pay",
  syntax: "pay [user name] [amount]",
  aliases: ["transfer"],

  callback({ args }) {
    if (args.length != 2) {
      pushErrorToLog(`Syntax: ${Pay.syntax}`)

      return
    }

    sendEvent(PAY_USER_EVENT, args)
  },
}
