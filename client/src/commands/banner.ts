import { CommandModule } from "./emitter"
import { changeBanner } from "../components/Header"
import { pushErrorToLog } from "../components/Terminal"
import { UPDATE_BANNER_EVENT, GAME_EVENT } from "../../../events"
import {
  sendEvent,
} from "../network"

export const Banner: CommandModule = {
  command: "banner",
  syntax: "banner [art/music/game]",
  bio: "change banner to display music sheet or room image",

  callback ({ args }) {
    const [type] = args
    
    if(args[0] === "game"){
      sendEvent(GAME_EVENT, args)
    }

    if (!type) {
      pushErrorToLog(`Syntax: ${Banner.syntax}`)

      return
    }
    //add toggle banner command

    changeBanner(type)    
    sendEvent(UPDATE_BANNER_EVENT, localStorage.player)
  },
}
