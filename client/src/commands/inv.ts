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
  syntax: "inv",
  aliases: ["inventory","bank","pocket"],

  callback() {
    sendEvent(INV_EVENT, null)
  },
}

export default Inv
