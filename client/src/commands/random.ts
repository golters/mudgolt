import { LOG_EVENT, RANDOM_EVENT } from "../../../events"
import { LogItem } from "../components/terminal"
import { sendEvent } from "../network"
import { commandEmitter, CommandModule } from "./emitter"

export const Random: CommandModule = {
  command: "random",

  callback ({ args }) {
    let max: number

    try {
      max = parseInt(args[0])

      if (isNaN(max)) throw new Error("Random max is NaN")
    } catch (error) {
      const errorItem = LogItem(`Syntax: random [int]`)
      errorItem.classList.toggle("error-message")

      commandEmitter.emit(LOG_EVENT, errorItem)

      return
    }

    sendEvent(RANDOM_EVENT, max)
  }
} 