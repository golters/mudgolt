import {
  USE_ITEM_EVENT,
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

export const UseItem: CommandModule = {
  command: "use",
  syntax: "use [item name]",
  bio: "activate the macro commands attached to an item",

  callback({ args }) {
    const [name] = args

    if (!name) {
      pushErrorToLog(`Syntax: ${UseItem.syntax}`)

      return
    }

    sendEvent(USE_ITEM_EVENT, name.trim())
  },
}
