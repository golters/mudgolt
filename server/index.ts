import { storeTask } from "./store/index.ts"

const init = async () => {
  await storeTask()
  await import("./network/index.ts")
  console.log("Server ready")
}

init().catch(console.error)
