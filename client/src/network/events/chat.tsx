import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  CHAT_EVENT,
} from "../../../../events"
import {
  Chat,
  Player, 
} from "../../../../@types"
import {
  Markdown, 
} from "../../components/Markdown"
import { pushToLog } from "../../components/Terminal"
import React from "react"

const handler: NetworkEventHandler = ({ player, message, date }: Chat) => {
  const matches = message.matchAll(/\b(https?:\/\/\S*?\.(?:png|jpe?g|gif)(?:\?(?:(?:(?:[\w_-]+=[\w_-]+)(?:&[\w_-]+=[\w_-]+)*)|(?:[\w_-]+)))?)\b/g)

  const embeds: JSX.Element[] = [...matches].map(match => {
    return <img src={match[1]} />
  })

  const formattedTimeParts = new Date(date)
    .toLocaleString()
    .split(' ')
    .slice(1, 3)

  const [formattedDate] = new Date(date)
    .toLocaleString()
    .split(',')
    .slice(0, 1)

    formattedTimeParts[0] = formattedTimeParts[0].split(':').slice(0, 2).join(":")

  pushToLog(
    <span className="chat-message">
      <span className="date">[{formattedDate} {formattedTimeParts.join(" ")}] </span>
      <span className="username">[{player.username}] </span>
      <Markdown string={message} />
      {embeds}
    </span>
  )
}

networkEmitter.on(CHAT_EVENT, handler)
