import { Game,Chat, Invite } from "../../@types"
import {
  db, 
} from "../store"
import { createGame, findGameByPlayer } from "./game"

export const sendInvite = async (player1: number, player2: number, type: string) => {
  const existinginvite = await findInviteByPlayer(player1, player2)
  if(existinginvite){
    throw new Error("Invite already exists")
  }
  await db.run(/*sql*/`
    INSERT INTO invites ("player1", "player2", "type")
      VALUES ($1, $2, $3)
  `, [player1, player2, type])
}

export const acceptInvite = async (invite: Invite) => {
  await createGame(invite.player1,invite.player2,invite.type)
  await closeInvite(invite)
  //[current move],[select/place],[position]
  const chessStart = "player1,select"  
  await db.run(/*sql*/`
  UPDATE games
    SET game_info = $1
    WHERE player1 = $2;
`, [chessStart, invite.player1])
}

export const closeInvite = async (invite: Invite) => {
  await db.run(/*sql*/`
    DELETE FROM invites WHERE "id" = $1;
  `, [
    invite.id,
  ])
}

export const findInviteByPlayer = async (player1: number, player2: number): Promise<Invite> => {
  const invite = await db.all<Invite[]>(/*sql*/`
    SELECT * FROM invites 
    WHERE "player1" = $1 
    AND "player2" = $2
  `, [player1,player2])

  return invite[0]
}

export const findOpenInvites = async (player: number): Promise<Invite[]> => {
  const invites = await db.all<Invite[]>(/*sql*/`
    SELECT * FROM invites 
    WHERE "player1" = $1 
    OR "player2" = $1
  `, [player])

  return invites
}
