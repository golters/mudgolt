import {
  networkEmitter, NetworkEventHandler, 
} from "./emitter"
import {
  broadcastToRoom, 
} from ".."
import {
  ROLL_EVENT, SERVER_LOG_EVENT, 
} from "../../../events"
import {
  Player, 
} from "../../../@types";

export interface DiceProps{
  count: number
  sides: number
}

const rollDice = (dice: DiceProps) => {
  let total = 0;

  if (dice.count + dice.sides > 69000) return "That's like, a really big number, so the result is 0."
  
  for (let i = 0; i < dice.count; i++){
    total += Math.floor(Math.random() * dice.sides) + 1;
  }

  return total;
}

const handler: NetworkEventHandler = (socket, dice: DiceProps, player: Player) => {
  const result = rollDice(dice);

  broadcastToRoom<string>(SERVER_LOG_EVENT, `${player.username} rolled ${dice.count}d${dice.sides} - ${result}`, player.roomId)
}

networkEmitter.on(ROLL_EVENT, handler)
