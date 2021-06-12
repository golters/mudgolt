import {
  commandModules, 
} from "."
import {
  logSimple,
} from "../components/Terminal"
import {
  CommandModule, 
} from "./emitter"

export const Help: CommandModule = {
  command: "help",
  syntax: `help`,

  callback () {
    logSimple('-- Command list --\n\n' + commandModules.map(({ syntax }) => syntax).join('\n'))
  },
}
