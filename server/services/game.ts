/* eslint-disable camelcase */
import {
  Game,
} from "../../@types"
import {
  db,
} from "../store"

export const createGame = async (player1Id: number, player2Id: number | undefined, type: string): Promise<Game> => {
  const existingGame = await db.get<Game>(/*sql*/`
    SELECT * FROM games
    WHERE "player1" = $1 
    OR "player2" = $1
    OR "player3" = $1
    OR "player4" = $1
  `, [player1Id])

  if (existingGame) {
    throw new Error("You are already in a game")
  }

  const game = await db.get(/*sql*/`
    INSERT INTO games ("player1", "player2", "type")
      VALUES ($1, $2, $3);
  `, [
    player1Id,
    player2Id,
    type,
  ])

  return game
}

export const endGame = async (game_id: number): Promise<void> => {
  await db.run(/*sql*/`
    DELETE FROM games WHERE "id" = $1;
  `, [
    game_id,
  ])
}

//join game

export const getGameById = async (game_id: number): Promise<Game> => {
  const game = await db.get<Game>(/*sql*/`
    SELECT * FROM games WHERE "id" = $1;
  `, [game_id])

  if (game === undefined) {
    throw new Error("door does not exist")		
  }
  
  return game
}
