import { BANNER_HEIGHT, BANNER_WIDTH } from "../../../constants"
import {
  COMPOSE_EVENT,
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


export const Compose: CommandModule = {
  command: "compose",
  syntax: `compose [0-${BANNER_WIDTH}] [0-${BANNER_HEIGHT}] [character]`,
  cost: "1",
  bio: "add notes to room music. try using █,▓,▒,░,◆,◇,◈,◐,◑,◒,◓,★,☆,☀,☁,♠,♡,♣,♢ for effects",

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

    sendEvent(COMPOSE_EVENT, [x, y, character])
  },

}
