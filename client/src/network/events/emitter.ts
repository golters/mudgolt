import Emitter from "events"

export type NetworkEventHandler = (payload: any) => void

export const networkEmitter = new Emitter()
