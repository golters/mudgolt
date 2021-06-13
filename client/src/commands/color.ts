import { resetColors, setColor } from '../utils/color';
import { CommandModule } from './emitter';
import { pushErrorToLog, pushToLog } from "../components/Terminal"

export const Color: CommandModule = {
  command: 'color',
  syntax: 'color [key] [value]',

  callback ({ args }) {
    let [key, value] = args;
    
    if (key === undefined && value === undefined) {
      resetColors();
      pushToLog('Color theme reset');
      return;
    }

    try {
      setColor(key, value);
      pushToLog(`Updated color "${key}" to "${value}"`);
    } catch (e) {
      pushErrorToLog(e.message)
    }
  }
}
