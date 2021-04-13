import Emitter from "events"
import WebSocket from "ws"

export type EventHandler = (socket: WebSocket, payload: any) => void

export const emitter = new Emitter()
