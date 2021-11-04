import { getConstantValue } from "typescript";
import validateColor from "validate-color";

import { ColorTheme } from "../types/ColorTheme";

const VALID_COLOR_KEYS = [
  "background-primary",
  "background-code",
  "text-primary",
  "text-secondary",
  "text-tertiary",
  "text-link",
  "text-negative",
  "divider",
  "scrollbar",
  "brush",
];

const VALID_COLOR_THEMES = [
  "amiga",
  "commodore",
  "green",
  "amber",
  "cga",
  "windows",
  "gba",
];

const DEFAULT_THEME: ColorTheme = {
  "background-primary": "black",
  "background-code": "rgb(26, 26, 39)",
  "text-primary": "white",
  "text-secondary": "rgba(255, 255, 255, 0.6)",
  "text-tertiary": "rgb(196, 92, 236)",
  "text-link": "rgb(83, 143, 255)",
  "text-negative": "rgb(228, 34, 76)",
  "divider": "rgb(35, 32, 35)",
  "scrollbar": "white",
  "brush": "grey",
}

const amiga: ColorTheme = {
  "background-primary": "#0055ab",
  "background-code": "#f5690d",
  "text-primary": "white",
  "text-secondary": "white",
  "text-tertiary": "white",
  "text-link": "white",
  "text-negative": "white)",
  "divider": "white",
  "scrollbar": "white",
  "brush": "#f5690d",
}
const commodore: ColorTheme = {
  "background-primary": "#4835ad",
  "background-code": "#8677e1",
  "text-primary": "#8677e1",
  "text-secondary": "#84cdcf",
  "text-tertiary": "#d9e474",
  "text-link": "#d9e474",
  "text-negative": "#d9e474",
  "divider": "#8677e1",
  "scrollbar": "#8677e1",
  "brush": "#d9e474",
}
const green: ColorTheme = {
  "background-primary": "#023401",
  "background-code": "#019f02",
  "text-primary": "#00ef11",
  "text-secondary": "#019f02",
  "text-tertiary": "#00ef11",
  "text-link": "#00ef11",
  "text-negative": "#00ef11",
  "divider": "#019f02",
  "scrollbar": "#019f02",
  "brush": "#019f02",
}
const amber: ColorTheme = {
  "background-primary": "#792400",
  "background-code": "#eb7900",
  "text-primary": "#ffdb30",
  "text-secondary": "#eb7900",
  "text-tertiary": "#ffdb30",
  "text-link": "#ffdb30",
  "text-negative": "#ffdb30",
  "divider": "#eb7900",
  "scrollbar": "#eb7900",
  "brush": "#eb7900",
}
const cga: ColorTheme = {
  "background-primary": "black",
  "background-code": "magenta",
  "text-primary": "white",
  "text-secondary": "magenta",
  "text-tertiary": "cyan",
  "text-link": "cyan",
  "text-negative": "cyan",
  "divider": "magenta",
  "scrollbar": "magenta",
  "brush": "magenta",
}
const windows: ColorTheme = {
  "background-primary": "#008483",
  "background-code": "#0e0087",
  "text-primary": "white",
  "text-secondary": "white",
  "text-tertiary": "white",
  "text-link": "black",
  "text-negative": "black",
  "divider": "#c3c3c3",
  "scrollbar": "#c3c3c3",
  "brush": "#0e0087",
}
const gba: ColorTheme = {
  "background-primary": "#081820",
  "background-code": "#346856",
  "text-primary": "#88c070",
  "text-secondary": "#88c070",
  "text-tertiary": "#e0f8d0",
  "text-link": "#e0f8d0",
  "text-negative": "#e0f8d0",
  "divider": "#346856",
  "scrollbar": "#346856",
  "brush": "#346856",
}

const THEME_STORAGE_KEY = "colorTheme";

const rootElement = document.documentElement;

class ColorUtil {
  /**
   * The user's current theme
   */
  private currentTheme: ColorTheme = DEFAULT_THEME;

  /**
   * Load a saved theme, if present
   */
  constructor() {
    const themeData = localStorage.getItem(THEME_STORAGE_KEY);
    if (themeData) {
      try {
        const parsedTheme: Partial<ColorTheme> = JSON.parse(themeData);
        for (const key in parsedTheme) {
          const value = parsedTheme[key as keyof typeof parsedTheme];
          rootElement.style.setProperty(`--color-${key}`, value!);
        }
        this.currentTheme = {
          ...DEFAULT_THEME,
          ...parsedTheme,
        };
      } catch {}
    }
  }

  /**
   * Whether a color key is valid
   * @param key The color key to validate 
   */
  public isValidColorKey = (key: string) => {
    return VALID_COLOR_KEYS.includes(key);
  }

  /**
   * Whether a color value is valid
   * @param value The color to validate
   */
  public isValidColor = (value: string) => {
    return validateColor(value);
  }

  /**
   * Whether a color theme is valid
   */
  public isValidColorTheme = (theme: string) => {
    return VALID_COLOR_THEMES.includes(theme);
  }

  /**
   * Update an individual color key
   */
  public setColor = (key: string, value: string) => {
    if (!this.isValidColorKey(key)) {
      throw new Error(`Invalid color key "${key}" - use one of: ${VALID_COLOR_KEYS.join(", ")}`)
    }
    if (!this.isValidColor(value)) {
      throw new Error(`Invalid color "${value}"`);
    }
    rootElement.style.setProperty(`--color-${key}`, value);
    this.currentTheme[key as keyof typeof DEFAULT_THEME] = value;
    this.saveTheme();
  }

  /**
   * Reset all color keys to the default theme
   */
  public resetColors = () => {
    for (const key in DEFAULT_THEME) {
      const value =  DEFAULT_THEME[key as keyof typeof DEFAULT_THEME];
      rootElement.style.setProperty(`--color-${key}`, value);
    }
    this.currentTheme = DEFAULT_THEME;
    this.saveTheme();
  }
  
  /**
   * change to preset color theme
   */
   public changeTheme = (theme: string) => {   
     if(!this.isValidColorTheme(theme)) {
       throw new Error(`Invalid theme or key "${theme}" - use one of: ${VALID_COLOR_KEYS.join(", ")}`);
     }
     //not ideal way of doing this optomise later
     switch(theme){
       case "amiga":
         for (const key in amiga) {
           const value = amiga[key as keyof typeof amiga];
           rootElement.style.setProperty(`--color-${key}`, value);
         }
         this.currentTheme = amiga;
         this.saveTheme();
         break;
       case "commodore":
         for (const key in commodore) {
           const value = commodore[key as keyof typeof commodore];
           rootElement.style.setProperty(`--color-${key}`, value);
         }
         this.currentTheme = commodore;
         this.saveTheme();
         break;
       case "green":
         for (const key in green) {
           const value = green[key as keyof typeof green];
           rootElement.style.setProperty(`--color-${key}`, value);
         }
         this.currentTheme = green;
         this.saveTheme();
         break;
       case "amber":
         for (const key in amber) {
           const value = amber[key as keyof typeof amber];
           rootElement.style.setProperty(`--color-${key}`, value);
         }
         this.currentTheme = amber;
         this.saveTheme();
         break;
       case "cga":
         for (const key in cga) {
           const value = cga[key as keyof typeof cga];
           rootElement.style.setProperty(`--color-${key}`, value);
         }
         this.currentTheme = cga;
         this.saveTheme();
         break;
       case "windows":
         for (const key in windows) {
           const value = windows[key as keyof typeof windows];
           rootElement.style.setProperty(`--color-${key}`, value);
         }
         this.currentTheme = windows;
         this.saveTheme();
         break;      
       case "gba":
         for (const key in gba) {
           const value = gba[key as keyof typeof gba];
           rootElement.style.setProperty(`--color-${key}`, value);
         }
         this.currentTheme = gba;
         this.saveTheme();
         break;
     }
   }

  /**
   * Save the current theme changes
   */
  public saveTheme = () => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(this.currentTheme));
  }
}

export const colorUtil = new ColorUtil();
