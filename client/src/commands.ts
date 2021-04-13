import { log } from "./logs"
import { sendEvent } from "./network"
import { CHAT_EVENT } from "../../events"

// process.stdin.on("data", buffer => {
//   const input = buffer.toString().trim()

//   const [command, ...args] = input.split(" ")

//   log(`> ${input}`)

//   if (command === "say") {
//     sendEvent(CHAT_EVENT, args.join(" "))
//   } else {
//     log(chalk.redBright(`Unknown command "${command}"`))
//   }
// })
