import {
  generateKeyPairSync,
  KeyExportOptions,
} from "crypto"

import path from "path"
import fs from "fs"

const home = process.env.APPDATA || process.env.HOME || "~/"
const storage = path.join(home, "mudgolt")
const keyFile = path.join(storage, "keyson")

export const keys = {
  privateKey: "",
  publicKey: "",
}

const keyOptions: KeyExportOptions<"pem"> = {
  type: "pkcs1",
  format: "pem"
}

if (!fs.existsSync(storage)) fs.mkdirSync(storage)

if (fs.existsSync(keyFile)) {
  const { privateKey, publicKey } = JSON.parse(fs.readFileSync(keyFile, 'utf-8'))

  Object.assign(keys, {
    privateKey,
    publicKey,
  })
} else {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 512,
  })

  Object.assign(keys, {
    privateKey: privateKey.export(keyOptions),
    publicKey: publicKey.export(keyOptions),
  })

  fs.writeFileSync(keyFile, JSON.stringify(keys, null, 2))
}
