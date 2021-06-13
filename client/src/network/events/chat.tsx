import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  CHAT_EVENT,
} from "../../../../events"
import {
  Player, 
} from "../../../../@types"
import {
  Markdown, 
} from "../../components/Markdown"
import { pushToLog } from "../../components/Terminal"
import React from "react"

const handler: NetworkEventHandler = (payload) => {
  const {
    player,
    message,
  } = payload as {
    player: Player
    message: string
  }

  console.log(payload)

  const matches = message.matchAll(/\b(https?:\/\/\S*?\.(?:png|jpe?g|gif)(?:\?(?:(?:(?:[\w_-]+=[\w_-]+)(?:&[\w_-]+=[\w_-]+)*)|(?:[\w_-]+)))?)\b/g)

  const embeds: JSX.Element[] = [...matches].map(match => {
    return <img src={match[1]} />
  })

  pushToLog(
    <span className="chat-message">
      <span className="username">[{player.username}] </span>
      <Markdown string={message} />
      {embeds}
    </span>
  )
}

networkEmitter.on(CHAT_EVENT, handler)
