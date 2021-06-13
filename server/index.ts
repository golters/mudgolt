import { storeTask } from "./store"

const init = async () => {
  await storeTask()
  await import("./network")
  console.log("Server ready")
}

init().catch(console.error)
