import { resetColors, setColor } from '../utils/color';
import { CommandModule } from './emitter';
import { logError, logSimple } from "../components/Terminal"

export const Color: CommandModule = {
  command: 'color',
  syntax: 'color [key] [value]',

  callback ({ args }) {
    let [key, value] = args;
    
    if (key === undefined && value === undefined) {
      resetColors();
      logSimple('Color theme reset');
      return;
    }

    try {
      setColor(key, value);
      logSimple(`Updated color "${key}" to "${value}"`);
    } catch (e) {
      logError(e.message)
    }
  }
}
