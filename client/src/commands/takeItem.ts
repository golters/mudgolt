import {
  TAKE_ITEM_EVENT,
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

export const TakeItem: CommandModule = {
  command: "takeitem",
  syntax: "take [item name]",
  aliases: ["pickup","grab","take"],
  bio: "take an item from the floor into your inventory",

  callback({ args }) {
    const [name] = args

    if (!name) {
      pushErrorToLog(`Syntax: ${TakeItem.syntax}`)

      return
    }

    sendEvent(TAKE_ITEM_EVENT, name.trim())
  },
}
