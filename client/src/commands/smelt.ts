import {
  SMELT_ITEM_EVENT,
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

export const Smelt: CommandModule = {
  command: "smelt",
  syntax: "smelt [item]",
  aliases: ["eat", "sell"],
  bio: "turn junk items back into golts",

  callback({ args }) {
    if (args.length != 1) {
      pushErrorToLog(`Syntax: ${Smelt.syntax}`)

      return
    }

    sendEvent(SMELT_ITEM_EVENT, args.join(" "))
  },
}
