import { CommandModule } from "./emitter"
import { changeBanner } from "../components/Header"
import { pushErrorToLog } from "../components/Terminal"
import { UPDATE_BANNER_EVENT } from "../../../events"
import {
  sendEvent,
} from "../network"

export const Banner: CommandModule = {
  command: "banner",
  syntax: "banner [art/music]",
  bio: "change banner to display music sheet or room image",

  callback ({ args }) {
    const [type] = args

    if (!type) {
      pushErrorToLog(`Syntax: ${Banner.syntax}`)

      return
    }
    //add toggle banner command

    changeBanner(type)    
    sendEvent(UPDATE_BANNER_EVENT, localStorage.player)
  },
}
