import {
  ROLL_EVENT,
} from "../../../events"
import {
  pushErrorToLog,
} from "../components/Terminal"
import {
  sendEvent,
} from "../network"
import {
  CommandModule,
} from "./emitter"

export const diceRegex = /(\d+)d(\d+)/;

export interface DiceProps {
  count: number
  sides: number
}

const defaultRoll: DiceProps = {
  count: 1,
  sides: 69,
}

const parseDice = (value: string) => {
  const match = value.match(diceRegex);
  if (!match) return false;
  if (match.length < 3) return false;

  return {
    count: parseInt(match[1]),
    sides: parseInt(match[2]),
  };
}

const parseNumber = (value: string) => {
  let result: DiceProps | boolean;

  if (!value) return defaultRoll;

  if (result = parseDice(value)) return result;

  if (!isNaN(parseInt(value))) {
    return {
      count: 1,
      sides: parseInt(value),
    };
  }

  return false;
}

const Roll: CommandModule = {
  command: "roll",
  syntax: "roll [int] or [int]d[int]",
  bio: "generate a random number or dice roll",

  callback({ args }) {
    let dice: DiceProps | boolean;

    try {
      dice = parseNumber(args[0])

      if (!dice) throw new Error("Hey that's not a number");
    } catch {
      pushErrorToLog(`Syntax: ${Roll.syntax}`)

      return
    }

    sendEvent(ROLL_EVENT, dice)
  },
}

export default Roll;
