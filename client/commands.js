import { log } from "./logs.js"
import chalk from "chalk"
import { client } from "./network/index.js"
import { CHAT_EVENT } from "../events.js"

process.stdin.on("data", buffer => {
  const input = buffer.toString().trim()

  const [command, ...args] = input.split(" ")

  log(`> ${input}`)

  if (command === "say") {
    client.sendEvent(CHAT_EVENT, args.join(" "))
  } else {
    log(chalk.gray("Invalid command."))
  }
})
