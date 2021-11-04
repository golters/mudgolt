import { CommandModule } from "./emitter"
import { setBrush } from "../components/Header"
import { pushErrorToLog } from "../components/Terminal"

export const Brush: CommandModule = {
  command: "brush",
  syntax: "brush [character]",

  callback ({ input }) {
    const character = input.replace("/brush ", "")

    if (character.length > 1) {
      pushErrorToLog("Brush may only be one character")

      return
    }

    setBrush(character)
  },
}
