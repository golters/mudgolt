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
  let shadow = ""
  if(colorPic > 0.5){
    color = "red"
    shadow = "2px 2px blue"
  }else{
    color = "blue"
    shadow = "2px 2px red"
  }
  pushToLog(<span style={{ fontStyle: "bold", opacity: "1", fontSize: "200%", background: color, fontFamily: "impact", color: "white", textShadow: shadow}}>{message}{embeds}</span>
  )
}

networkEmitter.on(CAMPAIGN_LOG_EVENT, handler)
