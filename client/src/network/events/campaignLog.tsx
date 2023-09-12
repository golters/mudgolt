import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  CAMPAIGN_LOG_EVENT,
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
  const colorPic = Math.random()
  let color = ""
  if(colorPic > 0.5){
    color = "red"
  }else{
    color = "blue"
  }
  pushToLog(<span style={{ fontStyle: "bold", opacity: "1", fontSize: "200%", background: color, fontFamily: "impact", color: "white"}}>{message}{embeds}</span>
  )
}

networkEmitter.on(CAMPAIGN_LOG_EVENT, handler)
