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
  bio: "add a command macro to an item that can be used with the /use command",
  cost: "1 per changed character",

  callback({ args }) {
    sendEvent(ENCHANT_ITEM_EVENT, args)
  },
}
