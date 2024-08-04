import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  CHAT_EVENT,
  LOOK_AT_EVENT,
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
import { sendEvent } from "../../network"
import {
  newWhisperWindow
} from "../../components/windows"


function lookUser(player: string |undefined){
  sendEvent(LOOK_AT_EVENT, player)
}

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
    
  const timestamp = Date.now() - date < 86400000
    ? formattedTimeParts.join(" ")
    : `${formattedDate} ${formattedTimeParts.join(" ")}`

  pushToLog(
    <span className="chat-message">
      <span className="date" title={new Date(date).toLocaleString()}>[{timestamp}] </span>
      <span className="username"><div className = "chatdropdown">[{player.username}] <div className="chatdropdown-content">{<div onClick={() => lookUser(player.username)}>Look</div>} {<div onClick={() => newWhisperWindow(player.username,null)}>Whisper</div>}</div></div></span>
      <Markdown string={message} />
      {embeds}
    </span>
  )
}

networkEmitter.on(CHAT_EVENT, handler)
