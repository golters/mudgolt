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
  pushToLog,
  pushErrorToLog,
} from "../components/Terminal"
import {
  Help,
} from "./help"
import Nick from "./username"
import React from "react"
import { Color } from './color'
import { Look } from './look'
import {
	Draw,
} from "./draw"
import {
	MakeDoor,
} from "./makeDoor"
import {
	Tp,
} from "./tp"
import {
	DeleteDoor,
} from "./deleteDoor"
import {
	Describe,
} from "./describe"
import {
  Brush,
} from "./brush"
import{
  Shout,
} from "./shout"
import{
  Whisper,
} from "./whisper"
import{
  Me
}from "./me"
import{
  Online
}from "./online"
import{
  MakeItem
}from "./makeItem"
import{
  Inv
}from "./inv"
import{
  DropItem
}from "./dropItem"
import{
  TakeItem
}from "./takeItem"
import{
  Inbox
}from "./inbox"
import{
  Send
}from "./send"
import{
  Reply
}from "./reply"
import{
  History
}from "./history"
import{
  UseItem
}from "./useItem"
import{
  EnchantItem
}from "./enchantItem"
import{
  Pay
}from "./pay"


export const commandModules = [
  Look,
  Go,
	Tp,
  Help,
  Nick,
  Inv,
  Color,
  Roll,
  Brush,
	Describe,
  MakeRoom,
	MakeDoor,
	DeleteDoor,
	Draw,
  Shout,
  Whisper,
  Inbox,
  Me,
  Online,
  MakeItem,
  DropItem,
  TakeItem,
  Send,
  Reply,
  History,
  UseItem,
  EnchantItem,
  Pay,
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

commandEmitter.on(INPUT_EVENT, (input: string) => {
  if (input.length > MESSAGE_MAX_LENGTH) {
    pushErrorToLog(`Message must not be longer than ${MESSAGE_MAX_LENGTH} characters.`)

    return
  }

  const commandName = input.trim().split(" ")[0]
  const command = findCommand(commandName)
  const args = parseArgs(commandName, input)

  if (command) {
    pushToLog(<span>&gt; {input}</span>)

    command.callback({
      args,
      input,
    })

    return
  }

  sendEvent(CHAT_EVENT, input)
})

export * from "./emitter"
