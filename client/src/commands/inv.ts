import {
  INV_EVENT,
} from "../../../events"
import { pushErrorToLog } from "../components/Terminal"
import {
  sendEvent,
} from "../network"
import {
  CommandModule,
} from "./emitter"

export const Inv: CommandModule = {
  command: "inv",
  syntax: "inventory",
  aliases: ["inventory","bank","pocket"],
  bio: "see what items you are carrying and how much money you have",

  callback() {
    sendEvent(INV_EVENT, null)
  },
}

export default Inv
