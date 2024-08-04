import {
  INSIGHT_EVENT,
} from "../../../events"
import {
  sendEvent, 
} from "../network"
import {
  CommandModule, 
} from "./emitter"
import {
  pushErrorToLog,
} from "../components/Terminal"

export const Insight: CommandModule = {
  command: "insight",
  syntax: "insight [item]",
  aliases: ["stats"],
  bio: "gain further insight into an item than you could from just looking",

  callback({ args }) {
    if(args.length <= 0){
      pushErrorToLog(`Syntax: ${Insight.syntax}`)

      return
    }else{
      sendEvent(INSIGHT_EVENT, args)
    }
  },
}
