import { Game,Chat, Invite } from "../../@types"
import {
  db, 
} from "../store"
import { createGame } from "./game"

export const sendInvite = async (player1: number, player2: number, type: string) => {
  await db.run(/*sql*/`
    INSERT INTO games ("player1", "player2", "type")
      VALUES ($1, $2, $3)
  `, [player1, player2, type])
  await 
}

export const acceptInvite = async (invite: Invite) => {
  await createGame(invite.player1,invite.player2,invite.type)
  await closeInvite(invite.id)
}

export const closeInvite = async (id: number) => {
  await db.run(/*sql*/`
    DELETE FROM invites WHERE "id" = $1;
  `, [
    id,
  ])
}

export const findInviteByPlayer = async (user_id: number) => {

}
