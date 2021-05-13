import Emitter from "events"
import WebSocket from "ws"
import {
  Player, 
} from "../../../@types"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NetworkEventHandler = (socket: WebSocket, payload: any, player: Player) => void

export const networkEmitter = new Emitter()
