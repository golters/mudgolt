import Emitter from "events"

export const commandEmitter = new Emitter()

export interface CommandModule {
  command: string
  syntax: string
  aliases?: string[]

  callback (props: {
    args: string[]
    input: string
  }): void | Promise<void>
}
