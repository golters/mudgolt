import path from "node:path"
import fs from "node:fs"
import { initStore } from "../services/init.ts"
import { Database } from "./database.ts"

const dbDirectory = path.join("./db")
const storeFile = path.join(dbDirectory, "store.db")

export let db: Database

export const storeTask = async () => {
  fs.mkdirSync(dbDirectory, { recursive: true })
  db = new Database(storeFile)
  await initStore()
}
