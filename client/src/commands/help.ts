import {
  commandModules, 
} from "."
import { HELP_EVENT, HELP_AT_EVENT } from "../../../events"
import {
  pushToLog,
  pushErrorToLog,
} from "../components/Terminal"
import {
  CommandModule, 
} from "./emitter"
import {
  sendEvent,
} from "../network"

export const Help: CommandModule = {
  command: "help",
  syntax: "help or /help [command] for more info",
  bio: "lists command syntaxes",

  callback({ args }) {
    const commands = commandModules
    let command = null
    commands.forEach(c => {
      if(c.command === args[0]){
        command = c
      }else if(c.aliases){
        c.aliases.forEach(a => {
          if(a === args[0])
            command = c
        });
      }
    });
    if(args.length <= 0){
      sendEvent(HELP_EVENT,commands)
    }else{
      if(command === null){
        pushErrorToLog(`${args[0]} is not a command`)

        return
      }
      sendEvent(HELP_AT_EVENT,command)
    }
  },
}
