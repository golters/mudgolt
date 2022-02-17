import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  COMMAND_LOG_EVENT, 
} from "../../../../events"
import {
  pushToLog, 
} from "../../components/Terminal"
import React from "react"
import {
  Markdown, 
} from "../../components/Markdown"
import {
  Chat,
} from "../../../../@types"

const handler: NetworkEventHandler = ({ message, date}: Chat) => {
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
    
  const timestamp = Date.now() - date < 86400000
    ? formattedTimeParts.join(" ")
    : `${formattedDate} ${formattedTimeParts.join(" ")}`

    pushToLog(
      <span className="chat-message">
    <span className="date" title={new Date(date).toLocaleString()}>[{timestamp}] </span>
    <span style={{ fontStyle: "italic", opacity: "0.7" }}>{message}{embeds}</span>
    </span>
    )
}

networkEmitter.on(COMMAND_LOG_EVENT, handler)
