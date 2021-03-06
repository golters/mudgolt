import { ITEM_COST, GOLT } from "../../../constants"
import {
  MAKE_ITEM_EVENT,
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

export const MakeItem: CommandModule = {
  command: "makeitem",
  syntax: "makeitem [item name]",
  bio: "create a blank item with no description or enchantment",
  cost: `${ITEM_COST} + ${GOLT}1 per character`,

  callback({ args }) {
    const [name] = args

    if (!name) {
      pushErrorToLog(`Syntax: ${MakeItem.syntax}`)

      return
    }

    sendEvent(MAKE_ITEM_EVENT, name.trim())
  },
}
