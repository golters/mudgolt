import { getConstantValue } from "typescript";
import validateColor from "validate-color";

import { ColorTheme, VALID_COLOR_KEYS } from "../types/ColorTheme";
import { themes } from "./themes"

const THEME_STORAGE_KEY = "colorTheme";

const rootElement = document.documentElement;

class ColorUtil {
  /**
   * The user's current theme
   */
  private currentTheme: ColorTheme = themes[0];

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
          ...themes[0],
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
    return themes.map(t => t.name).includes(theme);
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
    this.currentTheme[key as keyof typeof themes[0]] = value;
    this.saveTheme();
  }

  /**
   * Reset all color keys to the default theme
   */
  public resetColors = () => {
    for (const key in themes[0]) {
      const value =  themes[0][key as keyof typeof themes[0]];
      rootElement.style.setProperty(`--color-${key}`, value);
    }
    this.currentTheme = themes[0];
    this.saveTheme();
  }
  
  /**
   * change to preset color theme
   */
   public changeTheme = (theme: string) => {   
     if(!this.isValidColorTheme(theme)) {
       throw new Error(`Invalid theme or key "${theme}" - use one of: ${themes.map(t => t.name + ", ")}`);
     }
     //optomise later by putting all themes in same array and finding by name
     const tempThemeArray = themes
     const foundTheme = tempThemeArray.find(element => element.name === theme)
     if(!foundTheme){

       return
     }
     for (const key in foundTheme) {
       const value = foundTheme[key as keyof typeof foundTheme];
       rootElement.style.setProperty(`--color-${key}`, value);
     }
     this.currentTheme = foundTheme;
     this.saveTheme();
   }

  /**
   * Save the current theme changes
   */
  public saveTheme = () => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(this.currentTheme));
  }
}

export const colorUtil = new ColorUtil();
