import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  ERROR_EVENT,
  MAKE_ROOM_EVENT, SERVER_LOG_EVENT,
} from "../../../events"
import {
  sendEvent, 
} from "../../network"
import {
  createRoom, 
} from "../../services/room"

const NAME_LENGTH = 32

const handler: NetworkEventHandler = (socket, name: string) => {
  try {
    if (name.length > NAME_LENGTH) throw new Error(`Room name must not be greater than ${NAME_LENGTH} characters`)

    name = name.replace(/\s/g, "_")

    createRoom(name)

    sendEvent<string>(socket, SERVER_LOG_EVENT, `Created room ${name}`)
  } catch (error) {
    sendEvent<string>(socket, ERROR_EVENT, error.message)
  }
}


networkEmitter.on(MAKE_ROOM_EVENT, handler)
