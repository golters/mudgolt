import { Player } from "../../@types"
import { saveStore, store } from "../store"
import crypto from "crypto"

export const findOrCreatePlayer = (publicKey: string) => {
  const existingPlayer = store.players.find(player => player.publicKey === publicKey)

  if (existingPlayer) return existingPlayer

  const hash = crypto.createHash('md5')
  hash.update(publicKey)
  
  const player: Player = {
    id: store.players.length,
    publicKey,
    username: `1_${hash.digest('hex').slice(0, 6)}`,
    location: 0,
    inventory: [],
    golts: 500,
  }

  store.players.push(player)

  saveStore()

  return player
}
