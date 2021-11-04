import { BANNER_HEIGHT, BANNER_WIDTH } from "../../../constants"
import {
  DRAW_EVENT,
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


export const Draw: CommandModule = {
  command: "draw",
  syntax: `draw [0-${BANNER_WIDTH}] [0-${BANNER_HEIGHT}] [character]`,

  callback({ args }) {
    const x = parseInt(args[0])
    const y = parseInt(args[1])
    const character = args[2]

    if (typeof x !== "number" || typeof y !== "number" || typeof character !== "string") {
      pushErrorToLog(this.syntax)
      
      return
    }

    if (x >= BANNER_WIDTH || y >= BANNER_HEIGHT || x < 0 || y < 0) {
      pushErrorToLog(this.syntax)
      
      return
    }
    
    if (character.length > 1) {
      pushErrorToLog("Single character required")
      
      return
    }

    sendEvent(DRAW_EVENT, [x, y, character])
  },

}
