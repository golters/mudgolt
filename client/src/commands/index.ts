import {
  sendEvent,
} from "../network"
import {
  CHAT_EVENT, INPUT_EVENT,
} from "../../../events"
import {
  commandEmitter,
} from "./emitter"
import Roll from "./roll"
import {
  MakeRoom,
} from "./makeRoom"
import {
  Go,
} from "./go"
import {
  MESSAGE_MAX_LENGTH,
} from "../../../constants"
import {
  logError,
  logSimpleNoMarkdown,
} from "../components/Terminal"
import {
  Help,
} from "./help"
import Nick from "./username"

export const commandModules = [
  Roll,
  MakeRoom,
  Go,
  Help,
  Nick,
]

const findCommand = (nameOrAlias: string) => {
  return commandModules.find(({ command, aliases }) => {
    if (!nameOrAlias.startsWith("/")) {
      return false
    }

    const unprefixedNameOrAlias = nameOrAlias.replace("/", "")

    return (
      command.toLowerCase() === unprefixedNameOrAlias.toLowerCase() ||
      aliases?.map((alias) => alias.toLowerCase()).includes(unprefixedNameOrAlias)
    )
  })
}

const parseArgs = (command: string, input: string) => {
  return input
    .replace(command, "")
    .trim()
    .split(" ")
    .map((arg) => arg.trim())
    .filter((arg) => arg !== "")
}

commandEmitter.on(INPUT_EVENT, (input) => {
  if (input.length > MESSAGE_MAX_LENGTH) {
    logError(`Message must not be longer than ${MESSAGE_MAX_LENGTH} characters.`)

    return
  }

  const commandName = input.trim().split(" ")[0]
  const command = findCommand(commandName)
  const args = parseArgs(commandName, input)

  if (command) {
    logSimpleNoMarkdown(`> ${input}`)

    command.callback({
      args,
      input,
    })

    return
  }

  sendEvent(CHAT_EVENT, input)
})

export * from "./emitter"
