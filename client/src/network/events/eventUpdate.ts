import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  EVENT_UPDATE_EVENT, 
} from "../../../../events"
import {
  Event,
} from "../../../../@types"
import {
  pushToLog,
} from "../../components/Terminal"

const handler: NetworkEventHandler = (event: Event) => {
  localStorage.event = [event.type,event.start,event.end]
  
}

networkEmitter.on(EVENT_UPDATE_EVENT, handler)
