import Emitter from "events"
import WebSocket from "ws"

export type EventHandler = (socket: WebSocket, payload: Buffer) => void

export const emitter = new Emitter()
