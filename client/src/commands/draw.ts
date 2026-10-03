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
  cost: "1",
  bio: "place a character onto the room banner at those coordinates. this is an old command, just click on the banner to draw, left click to copy characters that are already on the banner",

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
    
    const regex = /\p{RI}\p{RI}|\p{Emoji}(\p{EMod}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?(\u{200D}\p{Emoji}(\p{EMod}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?)*|./gus
    const test = character.split(regex)
    if(test.length !== 5){
      pushErrorToLog("Single character required")

      return
    }   

    sendEvent(DRAW_EVENT, [x, y, character])
  },

}
