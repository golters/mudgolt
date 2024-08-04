import { Player } from "./Player"
/* eslint-disable camelcase */
export interface Game {
  id: number
  type: string
  banner: string
  game_info: string
  player1: number
  p1_score: number
  p1_pieces: string
  player2: number | null
  p2_score: number
  p2_pieces: string
  player3: number | null
  p3_score: number
  p3_pieces: string
  player4: number | null
  p4_score: number
  p4_pieces: string
}
