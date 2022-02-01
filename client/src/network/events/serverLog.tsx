import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  SERVER_LOG_EVENT, 
} from "../../../../events"
import {
  pushToLog, 
} from "../../components/Terminal"
import React from "react"

const handler: NetworkEventHandler = (message: string) => {
  const matches = message.matchAll(/\b(https?:\/\/\S*?\.(?:png|jpe?g|gif)(?:\?(?:(?:(?:[\w_-]+=[\w_-]+)(?:&[\w_-]+=[\w_-]+)*)|(?:[\w_-]+)))?)\b/g)

  const embeds: JSX.Element[] = [...matches].map(match => {
    return <img src={match[1]} />
  })
  pushToLog(<span style={{ fontStyle: "italic", opacity: "0.7" }}>{message}{embeds}</span>
  )
}

networkEmitter.on(SERVER_LOG_EVENT, handler)
