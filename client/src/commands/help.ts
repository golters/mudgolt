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
    logSimple('<u>Command list</u>\n' + commandModules.map(({ syntax }) => syntax).join('\n'))
  },
}
