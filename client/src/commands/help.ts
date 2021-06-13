import {
  commandModules, 
} from "."
import {
  pushToLog,
} from "../components/Terminal"
import {
  CommandModule, 
} from "./emitter"

export const Help: CommandModule = {
  command: "help",
  syntax: "help",

  callback () {
    pushToLog("<u>Command list</u>\n" + commandModules.map(({ syntax }) => syntax).join("\n"))
  },
}
