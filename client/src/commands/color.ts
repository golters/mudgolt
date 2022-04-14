import { colorUtil } from "../utils";
import { CommandModule } from "./emitter";
import { pushErrorToLog, pushToLog } from "../components/Terminal"
import {
  iconUtil,
} from "../utils"

export const Color: CommandModule = {
  command: "color",
  syntax: "color [key] [value] or '/color themes' for a list of themes",
  bio: "edit the colors you see on screen, do '/color themes' to get a list of preset themes then do '/color [theme]' to change to that",

  callback ({ args }) {
    const [key, value] = args;

    if(key == "themes" && value == undefined){
      pushErrorToLog("try themes: amiga, commodore, green, amber, windows, cga, gba, light")
    }else
    if (key != undefined && value == undefined){    
      try{
        colorUtil.changeTheme(key);
        iconUtil.changeFavicon(iconUtil.getFaviconUrl(0))
        pushToLog("Color theme changed");
      } catch (e){
        pushErrorToLog(e.message)
      }
    } else

    if (key === undefined && value === undefined) {
      colorUtil.resetColors();
      iconUtil.changeFavicon(iconUtil.getFaviconUrl(0))
      pushToLog("Color theme reset");
      
      return;
    } else{

      try {
        colorUtil.setColor(key, value);
        iconUtil.changeFavicon(iconUtil.getFaviconUrl(0))
        pushToLog(`Updated color "${key}" to "${value}"`);
      } catch (e) {
        pushErrorToLog(e.message)
      }
    }
  },
}
