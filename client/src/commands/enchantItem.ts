import {
  ENCHANT_ITEM_EVENT,
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

export const EnchantItem: CommandModule = {
  command: "enchant",
  syntax: "enchant [item name] [action]",

  callback({ args }) {
    sendEvent(ENCHANT_ITEM_EVENT, args)
  },
}
