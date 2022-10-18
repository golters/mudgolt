import { CommandModule } from "./emitter"
import { setBrush } from "../components/Header"
import { pushErrorToLog } from "../components/Terminal"

export const Brush: CommandModule = {
  command: "brush",
  syntax: "brush [character]",
  bio: "change the character you want to use for drawing on the banner with the cursor",

  callback ({ input }) {
    const character = input.replace("/brush ", "")

    const regex = /\p{RI}\p{RI}|\p{Emoji}(\p{EMod}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?(\u{200D}\p{Emoji}(\p{EMod}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?)*|./gus
    const test = character.split(regex)
    if(test.length !== 5){
      pushErrorToLog("Brush may only be one character")

      return
    }   

    setBrush(character)
  },
}
