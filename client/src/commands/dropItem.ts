import {
  DROP_ITEM_EVENT,
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

export const DropItem: CommandModule = {
  command: "drop",
  syntax: "drop [item name]",
  aliases: ["drop","throw","dropitem"],

  callback({ args }) {
    const [name] = args

    if (!name) {
      pushErrorToLog(`Syntax: ${DropItem.syntax}`)

      return
    }

    sendEvent(DROP_ITEM_EVENT, name.trim())
  },
}
