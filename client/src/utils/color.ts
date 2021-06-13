import validateColor from "validate-color";

import { ColorTheme } from '../types/ColorTheme';

const validColorKeys = [
  'background-primary',
  'background-code',
  'text-primary',
  'text-secondary',
  'text-tertiary',
  'text-link',
  'text-negative',
  'divider'
];

const defaultTheme: ColorTheme = {
  'background-primary': 'black',
  'background-code': 'rgb(26, 26, 39)',
  'text-primary': 'white',
  'text-secondary': 'rgba(255, 255, 255, 0.6)',
  'text-tertiary': 'rgb(196, 92, 236)',
  'text-link': 'rgb(83, 143, 255)',
  'text-negative': 'rgb(228, 34, 76)',
  'divider': 'rgb(35, 32, 35)',
}

const rootElement = document.documentElement;

class ColorUtil {
  /**
   * Whether a color key is valid
   * @param key The color key to validate 
   */
  public isValidColorKey = (key: string) => {
    return validColorKeys.includes(key);
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
      throw new Error(`Invalid color key "${key}" - use one of: ${validColorKeys.join(', ')}`)
    }
    if (!this.isValidColor(value)) {
      throw new Error(`Invalid color "${value}"`);
    }
    rootElement.style.setProperty(`--color-${key}`, value);
  }

  /**
   * Reset all color keys to the default theme
   */
  public resetColors = () => {
    for (let key in defaultTheme) {
      rootElement.style.setProperty(`--color-${key}`, defaultTheme[key as keyof typeof defaultTheme]);
    }
  }
}

export const colorUtil = new ColorUtil();
