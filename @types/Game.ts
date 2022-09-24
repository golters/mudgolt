import { Player } from "./Player"
/* eslint-disable camelcase */
export interface Game {
  id: number
  type: string
  banner: string
  player1: Partial<Player>
  p1_score: number
  p1_pieces: string
  player2: Partial<Player> | null
  p2_score: number
  p2_pieces: string
  player3: Partial<Player> | null
  p3_score: number
  p3_pieces: string
  player4: Partial<Player> | null
  p4_score: number
  p4_pieces: string
}
