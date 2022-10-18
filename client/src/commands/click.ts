import { BANNER_HEIGHT, BANNER_WIDTH } from "../../../constants"
import {
  CLICK_EVENT,
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


export const Click: CommandModule = {
  command: "click",
  syntax: `click [0-${BANNER_WIDTH}] [0-${BANNER_HEIGHT}]`,
  bio: "used to select and move game pieces",

  callback({ args }) {
    const x = parseInt(args[0])
    const y = parseInt(args[1])

    if (typeof x !== "number" || typeof y !== "number") {
      pushErrorToLog(this.syntax)
      
      return
    }

    if (x >= BANNER_WIDTH || y >= BANNER_HEIGHT || x < 0 || y < 0) {
      pushErrorToLog(this.syntax)
      
      return
    }

    sendEvent(CLICK_EVENT, [x, y])
  },

}
