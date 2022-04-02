import {
  HISTORY_EVENT,
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

export const History: CommandModule = {
  command: "history",
  syntax: "history or history [1-200]",
  aliases: ["log","past"],

  callback({ args }) {
    try{
      if(args.length === 0){
        sendEvent(HISTORY_EVENT, 1)

        return
      }
      if(args.length > 1){
        pushErrorToLog(`Syntax: ${History.syntax}`)

        return
      }
      const number = Number(args[0])
      if(!number){
        throw new Error("must be a number between 1 and 200")
      }
      if(number > 0 && number <= 200){
      }else{
        throw new Error("must be a number between 1 and 200")
      }
      sendEvent(HISTORY_EVENT, number)
    }catch{
      pushErrorToLog(`Syntax: ${History.syntax}`)

      return
    }
  },
}
