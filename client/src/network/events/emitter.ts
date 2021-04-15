import Emitter from "events"

export type EventHandler = (payload: any) => void

export const emitter = new Emitter()
