import {
  GAME_EVENT,
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

export const Game: CommandModule = {
  command: "Game",
  syntax: "Game [leave]",
  bio: "game specific commands",

  //check correct amount of args
  callback({ args }) {
    if(!args){      
      pushErrorToLog(`Syntax: ${Game.syntax}`)

      return
    }
    
    sendEvent(GAME_EVENT, args)
  },
}
