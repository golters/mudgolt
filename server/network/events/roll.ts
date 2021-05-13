import { networkEmitter, NetworkEventHandler } from "./emitter"
import { broadcastToRoom } from ".."
import { ROLL_EVENT, SERVER_LOG_EVENT } from "../../../events"
import { Player } from "../../../@types";

export interface DiceProps{
  count: number
  sides: number
}

const rollDice = (dice: DiceProps) => {
  let total: number = 0;
  
  for (let i = 0; i < dice.count; i++){
    total += Math.floor(Math.random() * dice.sides) + 1;
  }

  return total;
}

const handler: NetworkEventHandler = (socket, dice: DiceProps, player: Player) => {
  const result = rollDice(dice);

  broadcastToRoom(SERVER_LOG_EVENT, `${player.username} rolled ${dice.count}d${dice.sides} - ${result}`, player.room)
}

networkEmitter.on(ROLL_EVENT, handler)
