import { CommandModule } from "./emitter"
import { pushErrorToLog } from "../components/Terminal"

export const Volume: CommandModule = {
  command: "volume",
  syntax: "volume [number]",
  bio: "sets volume of background music. 0.2 recomended",

  callback ({ args }) {
    const [type] = args

    if (!type) {
      pushErrorToLog(`Syntax: ${Volume.syntax}`)

      return
    }
    localStorage.volume = type  
    //sendEvent(UPDATE_BANNER_EVENT, localStorage.player)
  },
}
