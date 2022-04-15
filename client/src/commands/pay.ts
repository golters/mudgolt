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
  bio: "send money to another user, they do not have to be online or in the same room",

  callback({ args }) {
    if(isNaN(Number(args[1]))){
      pushErrorToLog(`Syntax: ${Pay.syntax}`)

      return
    }
    if (args.length != 2) {
      pushErrorToLog(`Syntax: ${Pay.syntax}`)

      return
    }

    sendEvent(PAY_USER_EVENT, args)
  },
}
