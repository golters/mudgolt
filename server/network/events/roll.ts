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
import {
  insertRoomCommand,
} from "../../services/chat"
import {
  getCurrentEvent,
  getBearName,
} from "../../services/event"

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

const handler: NetworkEventHandler = async (socket, dice: DiceProps, player: Player) => {
  const result = rollDice(dice);
  let username = player.username
  const event = await getCurrentEvent(Date.now())    
  if(event){
    switch (event.type){
      case "Bear_Week":
        const bearname = await getBearName(event.id, player.id)
        if(bearname){
          username = bearname
        }

        break;
    }
  }

  broadcastToRoom<string>(SERVER_LOG_EVENT, `${username} rolled ${dice.count}d${dice.sides} - ${result}`, player.roomId)
  insertRoomCommand(player.roomId, player.id, `rolled ${dice.count}d${dice.sides} - ${result}`, Date.now(), "roll")
}

networkEmitter.on(ROLL_EVENT, handler)
