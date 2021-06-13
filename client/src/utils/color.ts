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

export const isValidColorKey = (key: string) => {
  return validColorKeys.includes(key);
}

export const isValidColor = (value: string) => {
  return validateColor(value);
}

export const setColor = (key: string, value: string) => {
  if (!isValidColorKey(key)) {
    throw new Error(`Invalid color key "${key}" - use one of: ${validColorKeys.join(', ')}`)
  }
  if (!validateColor(value)) {
    throw new Error(`Invalid color "${value}"`);
  }
  rootElement.style.setProperty(`--color-${key}`, value);
}

export const resetColors = () => {
  for (let key in defaultTheme) {
    rootElement.style.setProperty(`--color-${key}`, defaultTheme[key]);
  }
}