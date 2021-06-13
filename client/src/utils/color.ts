import validateColor from "validate-color";

import { ColorTheme } from '../types/ColorTheme';

const VALID_COLOR_KEYS = [
  'background-primary',
  'background-code',
  'text-primary',
  'text-secondary',
  'text-tertiary',
  'text-link',
  'text-negative',
  'divider',
  'scrollbar'
];

const DEFAULT_THEME: ColorTheme = {
  'background-primary': 'black',
  'background-code': 'rgb(26, 26, 39)',
  'text-primary': 'white',
  'text-secondary': 'rgba(255, 255, 255, 0.6)',
  'text-tertiary': 'rgb(196, 92, 236)',
  'text-link': 'rgb(83, 143, 255)',
  'text-negative': 'rgb(228, 34, 76)',
  'divider': 'rgb(35, 32, 35)',
  'scrollbar': 'white',
}

const THEME_STORAGE_KEY = 'colorTheme';

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
        for (let key in parsedTheme) {
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
   * Update an individual color key
   */
  public setColor = (key: string, value: string) => {
    if (!this.isValidColorKey(key)) {
      throw new Error(`Invalid color key "${key}" - use one of: ${VALID_COLOR_KEYS.join(', ')}`)
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
    for (let key in DEFAULT_THEME) {
      const value =  DEFAULT_THEME[key as keyof typeof DEFAULT_THEME];
      rootElement.style.setProperty(`--color-${key}`, value);
    }
    this.currentTheme = DEFAULT_THEME;
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
