import {
  USERNAME_CHANGE_EVENT,
} from "../../../events"
import { pushErrorToLog } from "../components/Terminal"
import {
  sendEvent,
} from "../network"
import {
  CommandModule,
} from "./emitter"

const Username: CommandModule = {
  command: "username",
  syntax: "username [new username]",
  aliases: ["name", "nick", "nickname"],

  callback({ args }) {
    let [nickname] = args

    nickname = nickname?.trim()

    nickname
      ? sendEvent(USERNAME_CHANGE_EVENT, nickname)
      : pushErrorToLog(`Syntax: ${Username.syntax}`)
  },
}

export default Username
