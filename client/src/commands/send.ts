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
  syntax: "send [item name] [user name]",
  aliases: ["deliver","mail","post", "give"],
  bio: "send an item from your inventory to another user, they do not have to be in the same room or online",

  callback({ args }) {
    if (args.length != 2) {
      pushErrorToLog(`Syntax: ${Send.syntax}`)

      return
    }

    sendEvent(SEND_EVENT, args)
  },
}
