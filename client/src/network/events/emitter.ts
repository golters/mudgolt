import Emitter from "events"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NetworkEventHandler = (payload: any) => void

export const networkEmitter = new Emitter()
