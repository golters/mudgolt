import Emitter from "events"
import WebSocket from "ws"
import { Player } from "../../../@types"

export type EventHandler = (socket: WebSocket, payload: any, player: Player) => void

export const emitter = new Emitter()
