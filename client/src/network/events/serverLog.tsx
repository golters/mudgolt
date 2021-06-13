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
  pushToLog(<span style={{ fontStyle: "italic", opacity: "0.7" }}>{message}</span>)
}

networkEmitter.on(SERVER_LOG_EVENT, handler)
