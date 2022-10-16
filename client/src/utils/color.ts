import { getConstantValue } from "typescript";
import validateColor from "validate-color";

import { ColorTheme } from "../types/ColorTheme";

const VALID_COLOR_KEYS = [
  "toolbar-back",
  "toolbar-button-back",
  "toolbar-button-logos",
  "toolbar-button-back-hover",
  "toolbar-button-logos-hover",
  "toolbar-dropdown-back",
  "toolbar-dropdown-text",
  "toolbar-hovernames-back",
  "toolbar-hovernames-text",
  "toolbar-slider-back",
  "toolbar-slider-thumb",
  "toolbar-slider-back-hover",
  "toolbar-slider-thumb-hover",
  "toolbar-charlimit",
  "toolbar-charlimit-over",
  "toolbar-charlimit-back",
  "toolbar-charlimit-over-back",
  "toolbar-publish-button-text",
  "toolbar-publish-button-back",
  "toolbar-publish-button-text-hover",
  "toolbar-publish-button-back-hover",
  "toolbar-sub-button-text",
  "toolbar-sub-button-back",
  "toolbar-sub-button-text-hover",
  "toolbar-sub-button-back-hover",
  "toolbar-palette-text",
  "toolbar-palette-back",
  "toolbar-palette-text-hover",
  "toolbar-palette-back-hover",
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

export const VALID_COLOR_THEMES = [
  "dark",
  "amiga",
  "commodore",
  "green",
  "amber",
  "cga",
  "windows",
  "gba",
  "light",
];

const DEFAULT_THEME: ColorTheme = {
  "toolbar-back": "white",
  "toolbar-edge": "none",
  "toolbar-button-back": "rbgb(0,0,0,0)",
  "toolbar-button-logos": "black",
  "toolbar-button-back-hover": "black",
  "toolbar-button-logos-hover": "white",
  "toolbar-button-edge": "none",
  "toolbar-button-edge-hover": "none",
  "toolbar-dropdown-back": "white",
  "toolbar-dropdown-text": "black",
  "toolbar-dropdown-edge": "none",
  "toolbar-hovernames-back": "black",
  "toolbar-hovernames-text": "white",
  "toolbar-hovernames-edge": "none",
  "toolbar-slider-back": "grey",
  "toolbar-slider-back-edge": "none",
  "toolbar-slider-thumb": "black",
  "toolbar-slider-thumb-edge": "none",
  "toolbar-slider-back-hover": "black",
  "toolbar-slider-back-edge-hover": "none",
  "toolbar-slider-thumb-hover": "grey",
  "toolbar-slider-thumb-edge-hover": "none",
  "toolbar-charlimit": "black",
  "toolbar-charlimit-over": "magenta",
  "toolbar-charlimit-back": "rbgb(0,0,0,0)",
  "toolbar-charlimit-over-back": "rbgb(0,0,0,0)",
  "toolbar-input-text": "black",
  "toolbar-input-back": "rbgb(0,0,0,0)",
  "toolbar-input-edge": "none",
  "toolbar-publish-button-text": "black",
  "toolbar-publish-button-back": "rbgb(0,0,0,0)",
  "toolbar-publish-button-edge": "none",
  "toolbar-publish-button-text-hover": "white",
  "toolbar-publish-button-back-hover": "black",
  "toolbar-publish-button-edge-hover": "none",
  "toolbar-sub-button-text":"black",
  "toolbar-sub-button-back":"rbgb(0,0,0,0)",
  "toolbar-sub-button-edge":"none",
  "toolbar-sub-button-text-hover":"white",
  "toolbar-sub-button-back-hover":"black",
  "toolbar-sub-button-edge-hover":"none",
  "toolbar-palette-text":"black",
  "toolbar-palette-back":"rbgb(0,0,0,0)",
  "toolbar-palette-text-hover":"magenta",
  "toolbar-palette-back-hover":"rbgb(0,0,0,0)",

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


const dark: ColorTheme = {
  "toolbar-back": "white",
  "toolbar-edge": "none",
  "toolbar-button-back": "rbgb(0,0,0,0)",
  "toolbar-button-logos": "black",
  "toolbar-button-back-hover": "black",
  "toolbar-button-logos-hover": "white",
  "toolbar-button-edge": "none",
  "toolbar-button-edge-hover": "none",
  "toolbar-dropdown-back": "white",
  "toolbar-dropdown-text": "black",
  "toolbar-dropdown-edge": "none",
  "toolbar-hovernames-back": "black",
  "toolbar-hovernames-text": "white",
  "toolbar-hovernames-edge": "none",
  "toolbar-slider-back": "grey",
  "toolbar-slider-back-edge": "none",
  "toolbar-slider-thumb": "black",
  "toolbar-slider-thumb-edge": "none",
  "toolbar-slider-back-hover": "black",
  "toolbar-slider-back-edge-hover": "none",
  "toolbar-slider-thumb-hover": "grey",
  "toolbar-slider-thumb-edge-hover": "none",
  "toolbar-charlimit": "black",
  "toolbar-charlimit-over": "magenta",
  "toolbar-charlimit-back": "rbgb(0,0,0,0)",
  "toolbar-charlimit-over-back": "rbgb(0,0,0,0)",
  "toolbar-input-text": "black",
  "toolbar-input-back": "rbgb(0,0,0,0)",
  "toolbar-input-edge": "none",
  "toolbar-publish-button-text": "black",
  "toolbar-publish-button-back": "rbgb(0,0,0,0)",
  "toolbar-publish-button-edge": "none",
  "toolbar-publish-button-text-hover": "white",
  "toolbar-publish-button-back-hover": "black",
  "toolbar-publish-button-edge-hover": "none",
  "toolbar-sub-button-text":"black",
  "toolbar-sub-button-back":"rbgb(0,0,0,0)",
  "toolbar-sub-button-edge":"none",
  "toolbar-sub-button-text-hover":"white",
  "toolbar-sub-button-back-hover":"black",
  "toolbar-sub-button-edge-hover":"none",
  "toolbar-palette-text":"black",
  "toolbar-palette-back":"rbgb(0,0,0,0)",
  "toolbar-palette-text-hover":"magenta",
  "toolbar-palette-back-hover":"rbgb(0,0,0,0)",

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
  "toolbar-back": "white",
  "toolbar-edge": "outset",
  "toolbar-button-back": "white",
  "toolbar-button-logos": "black",
  "toolbar-button-back-hover": "grey",
  "toolbar-button-logos-hover": "black",
  "toolbar-button-edge": "outset",
  "toolbar-button-edge-hover": "inset",
  "toolbar-dropdown-back": "white",
  "toolbar-dropdown-text": "black",
  "toolbar-dropdown-edge": "outset",
  "toolbar-hovernames-back": "white",
  "toolbar-hovernames-text": "black",
  "toolbar-hovernames-edge": "outset",
  "toolbar-slider-back": "grey",
  "toolbar-slider-back-edge": "inset",
  "toolbar-slider-thumb": "white",
  "toolbar-slider-thumb-edge": "outset",
  "toolbar-slider-back-hover": "black",
  "toolbar-slider-back-edge-hover": "inset",
  "toolbar-slider-thumb-hover": "grey",
  "toolbar-slider-thumb-edge-hover": "inset",
  "toolbar-charlimit": "black",
  "toolbar-charlimit-over": "magenta",
  "toolbar-charlimit-back": "white",
  "toolbar-charlimit-over-back": "white",
  "toolbar-input-text": "white",
  "toolbar-input-back": "grey",
  "toolbar-input-edge": "inset",
  "toolbar-publish-button-text": "black",
  "toolbar-publish-button-back": "white",
  "toolbar-publish-button-edge": "outset",
  "toolbar-publish-button-text-hover": "white",
  "toolbar-publish-button-back-hover": "grey",
  "toolbar-publish-button-edge-hover": "inset",
  "toolbar-sub-button-text":"black",
  "toolbar-sub-button-back":"white",
  "toolbar-sub-button-edge": "outset",
  "toolbar-sub-button-text-hover":"white",
  "toolbar-sub-button-back-hover":"grey",
  "toolbar-sub-button-edge-hover":"inset",
  "toolbar-palette-text":"black",
  "toolbar-palette-back":"white",
  "toolbar-palette-text-hover":"magenta",
  "toolbar-palette-back-hover":"white",
  
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
  "toolbar-back": "white",
  "toolbar-edge": "outset",
  "toolbar-button-back": "white",
  "toolbar-button-logos": "black",
  "toolbar-button-back-hover": "grey",
  "toolbar-button-logos-hover": "black",
  "toolbar-button-edge": "outset",
  "toolbar-button-edge-hover": "inset",
  "toolbar-dropdown-back": "white",
  "toolbar-dropdown-text": "black",
  "toolbar-dropdown-edge": "outset",
  "toolbar-hovernames-back": "white",
  "toolbar-hovernames-text": "black",
  "toolbar-hovernames-edge": "inset",
  "toolbar-slider-back": "grey",
  "toolbar-slider-back-edge": "inset",
  "toolbar-slider-thumb": "white",
  "toolbar-slider-thumb-edge": "outset",
  "toolbar-slider-back-hover": "black",
  "toolbar-slider-back-edge-hover": "inset",
  "toolbar-slider-thumb-hover": "grey",
  "toolbar-slider-thumb-edge-hover": "inset",
  "toolbar-charlimit": "black",
  "toolbar-charlimit-over": "magenta",
  "toolbar-charlimit-back": "white",
  "toolbar-charlimit-over-back": "white",
  "toolbar-input-text": "white",
  "toolbar-input-back": "grey",
  "toolbar-input-edge": "inset",
  "toolbar-publish-button-text": "black",
  "toolbar-publish-button-back": "white",
  "toolbar-publish-button-edge": "outset",
  "toolbar-publish-button-text-hover": "white",
  "toolbar-publish-button-back-hover": "grey",
  "toolbar-publish-button-edge-hover": "inset",
  "toolbar-sub-button-text":"black",
  "toolbar-sub-button-back":"white",
  "toolbar-sub-button-edge": "outset",
  "toolbar-sub-button-text-hover":"white",
  "toolbar-sub-button-back-hover":"grey",
  "toolbar-sub-button-edge-hover":"inset",
  "toolbar-palette-text":"black",
  "toolbar-palette-back":"white",
  "toolbar-palette-text-hover":"magenta",
  "toolbar-palette-back-hover":"white",

  "background-primary": "#4835ad",
  "background-code": "#84cdcf",
  "text-primary": "#8677e1",
  "text-secondary": "#84cdcf",
  "text-tertiary": "#d9e474",
  "text-link": "#d9e474",
  "text-negative": "#d9e474",
  "divider": "#8677e1",
  "scrollbar": "#8677e1",
  "brush": "#8677e1",
}
const green: ColorTheme = {
  "toolbar-back": "white",
  "toolbar-edge": "outset",
  "toolbar-button-back": "white",
  "toolbar-button-logos": "black",
  "toolbar-button-back-hover": "grey",
  "toolbar-button-logos-hover": "black",
  "toolbar-button-edge": "outset",
  "toolbar-button-edge-hover": "inset",
  "toolbar-dropdown-back": "white",
  "toolbar-dropdown-text": "black",
  "toolbar-dropdown-edge": "outset",
  "toolbar-hovernames-back": "white",
  "toolbar-hovernames-text": "black",
  "toolbar-hovernames-edge": "inset",
  "toolbar-slider-back": "grey",
  "toolbar-slider-back-edge": "inset",
  "toolbar-slider-thumb": "white",
  "toolbar-slider-thumb-edge": "outset",
  "toolbar-slider-back-hover": "black",
  "toolbar-slider-back-edge-hover": "inset",
  "toolbar-slider-thumb-hover": "grey",
  "toolbar-slider-thumb-edge-hover": "inset",
  "toolbar-charlimit": "black",
  "toolbar-charlimit-over": "magenta",
  "toolbar-charlimit-back": "white",
  "toolbar-charlimit-over-back": "white",
  "toolbar-input-text": "white",
  "toolbar-input-back": "grey",
  "toolbar-input-edge": "inset",
  "toolbar-publish-button-text": "black",
  "toolbar-publish-button-back": "white",
  "toolbar-publish-button-edge": "outset",
  "toolbar-publish-button-text-hover": "white",
  "toolbar-publish-button-back-hover": "grey",
  "toolbar-publish-button-edge-hover": "inset",
  "toolbar-sub-button-text":"black",
  "toolbar-sub-button-back":"white",
  "toolbar-sub-button-edge": "outset",
  "toolbar-sub-button-text-hover":"white",
  "toolbar-sub-button-back-hover":"grey",
  "toolbar-sub-button-edge-hover":"inset",
  "toolbar-palette-text":"black",
  "toolbar-palette-back":"white",
  "toolbar-palette-text-hover":"magenta",
  "toolbar-palette-back-hover":"white",

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
  "toolbar-back": "white",
  "toolbar-edge": "outset",
  "toolbar-button-back": "white",
  "toolbar-button-logos": "black",
  "toolbar-button-back-hover": "grey",
  "toolbar-button-logos-hover": "black",
  "toolbar-button-edge": "outset",
  "toolbar-button-edge-hover": "inset",
  "toolbar-dropdown-back": "white",
  "toolbar-dropdown-text": "black",
  "toolbar-dropdown-edge": "outset",
  "toolbar-hovernames-back": "white",
  "toolbar-hovernames-text": "black",
  "toolbar-hovernames-edge": "inset",
  "toolbar-slider-back": "grey",
  "toolbar-slider-back-edge": "inset",
  "toolbar-slider-thumb": "white",
  "toolbar-slider-thumb-edge": "outset",
  "toolbar-slider-back-hover": "black",
  "toolbar-slider-back-edge-hover": "inset",
  "toolbar-slider-thumb-hover": "grey",
  "toolbar-slider-thumb-edge-hover": "inset",
  "toolbar-charlimit": "black",
  "toolbar-charlimit-over": "magenta",
  "toolbar-charlimit-back": "white",
  "toolbar-charlimit-over-back": "white",
  "toolbar-input-text": "white",
  "toolbar-input-back": "grey",
  "toolbar-input-edge": "inset",
  "toolbar-publish-button-text": "black",
  "toolbar-publish-button-back": "white",
  "toolbar-publish-button-edge": "outset",
  "toolbar-publish-button-text-hover": "white",
  "toolbar-publish-button-back-hover": "grey",
  "toolbar-publish-button-edge-hover": "inset",
  "toolbar-sub-button-text":"black",
  "toolbar-sub-button-back":"white",
  "toolbar-sub-button-edge": "outset",
  "toolbar-sub-button-text-hover":"white",
  "toolbar-sub-button-back-hover":"grey",
  "toolbar-sub-button-edge-hover":"inset",
  "toolbar-palette-text":"black",
  "toolbar-palette-back":"white",
  "toolbar-palette-text-hover":"magenta",
  "toolbar-palette-back-hover":"white",

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
  "toolbar-back": "white",
  "toolbar-edge": "outset",
  "toolbar-button-back": "white",
  "toolbar-button-logos": "black",
  "toolbar-button-back-hover": "grey",
  "toolbar-button-logos-hover": "black",
  "toolbar-button-edge": "outset",
  "toolbar-button-edge-hover": "inset",
  "toolbar-dropdown-back": "white",
  "toolbar-dropdown-text": "black",
  "toolbar-dropdown-edge": "outset",
  "toolbar-hovernames-back": "white",
  "toolbar-hovernames-text": "black",
  "toolbar-hovernames-edge": "inset",
  "toolbar-slider-back": "grey",
  "toolbar-slider-back-edge": "inset",
  "toolbar-slider-thumb": "white",
  "toolbar-slider-thumb-edge": "outset",
  "toolbar-slider-back-hover": "black",
  "toolbar-slider-back-edge-hover": "inset",
  "toolbar-slider-thumb-hover": "grey",
  "toolbar-slider-thumb-edge-hover": "inset",
  "toolbar-charlimit": "black",
  "toolbar-charlimit-over": "magenta",
  "toolbar-charlimit-back": "white",
  "toolbar-charlimit-over-back": "white",
  "toolbar-input-text": "white",
  "toolbar-input-back": "grey",
  "toolbar-input-edge": "inset",
  "toolbar-publish-button-text": "black",
  "toolbar-publish-button-back": "white",
  "toolbar-publish-button-edge": "outset",
  "toolbar-publish-button-text-hover": "white",
  "toolbar-publish-button-back-hover": "grey",
  "toolbar-publish-button-edge-hover": "inset",
  "toolbar-sub-button-text":"black",
  "toolbar-sub-button-back":"white",
  "toolbar-sub-button-edge": "outset",
  "toolbar-sub-button-text-hover":"white",
  "toolbar-sub-button-back-hover":"grey",
  "toolbar-sub-button-edge-hover":"inset",
  "toolbar-palette-text":"black",
  "toolbar-palette-back":"white",
  "toolbar-palette-text-hover":"magenta",
  "toolbar-palette-back-hover":"white",

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
  "toolbar-back": "white",
  "toolbar-edge": "outset",
  "toolbar-button-back": "white",
  "toolbar-button-logos": "black",
  "toolbar-button-back-hover": "grey",
  "toolbar-button-logos-hover": "black",
  "toolbar-button-edge": "outset",
  "toolbar-button-edge-hover": "inset",
  "toolbar-dropdown-back": "white",
  "toolbar-dropdown-text": "black",
  "toolbar-dropdown-edge": "outset",
  "toolbar-hovernames-back": "white",
  "toolbar-hovernames-text": "black",
  "toolbar-hovernames-edge": "inset",
  "toolbar-slider-back": "grey",
  "toolbar-slider-back-edge": "inset",
  "toolbar-slider-thumb": "white",
  "toolbar-slider-thumb-edge": "outset",
  "toolbar-slider-back-hover": "black",
  "toolbar-slider-back-edge-hover": "inset",
  "toolbar-slider-thumb-hover": "grey",
  "toolbar-slider-thumb-edge-hover": "inset",
  "toolbar-charlimit": "black",
  "toolbar-charlimit-over": "magenta",
  "toolbar-charlimit-back": "white",
  "toolbar-charlimit-over-back": "white",
  "toolbar-input-text": "white",
  "toolbar-input-back": "grey",
  "toolbar-input-edge": "inset",
  "toolbar-publish-button-text": "black",
  "toolbar-publish-button-back": "white",
  "toolbar-publish-button-edge": "outset",
  "toolbar-publish-button-text-hover": "white",
  "toolbar-publish-button-back-hover": "grey",
  "toolbar-publish-button-edge-hover": "inset",
  "toolbar-sub-button-text":"black",
  "toolbar-sub-button-back":"white",
  "toolbar-sub-button-edge": "outset",
  "toolbar-sub-button-text-hover":"white",
  "toolbar-sub-button-back-hover":"grey",
  "toolbar-sub-button-edge-hover":"inset",
  "toolbar-palette-text":"black",
  "toolbar-palette-back":"white",
  "toolbar-palette-text-hover":"magenta",
  "toolbar-palette-back-hover":"white",

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
  "toolbar-back": "white",
  "toolbar-edge": "outset",
  "toolbar-button-back": "white",
  "toolbar-button-logos": "black",
  "toolbar-button-back-hover": "grey",
  "toolbar-button-logos-hover": "black",
  "toolbar-button-edge": "outset",
  "toolbar-button-edge-hover": "inset",
  "toolbar-dropdown-back": "white",
  "toolbar-dropdown-text": "black",
  "toolbar-dropdown-edge": "outset",
  "toolbar-hovernames-back": "white",
  "toolbar-hovernames-text": "black",
  "toolbar-hovernames-edge": "inset",
  "toolbar-slider-back": "grey",
  "toolbar-slider-back-edge": "inset",
  "toolbar-slider-thumb": "white",
  "toolbar-slider-thumb-edge": "outset",
  "toolbar-slider-back-hover": "black",
  "toolbar-slider-back-edge-hover": "inset",
  "toolbar-slider-thumb-hover": "grey",
  "toolbar-slider-thumb-edge-hover": "inset",
  "toolbar-charlimit": "black",
  "toolbar-charlimit-over": "magenta",
  "toolbar-charlimit-back": "white",
  "toolbar-charlimit-over-back": "white",
  "toolbar-input-text": "white",
  "toolbar-input-back": "grey",
  "toolbar-input-edge": "inset",
  "toolbar-publish-button-text": "black",
  "toolbar-publish-button-back": "white",
  "toolbar-publish-button-edge": "outset",
  "toolbar-publish-button-text-hover": "white",
  "toolbar-publish-button-back-hover": "grey",
  "toolbar-publish-button-edge-hover": "inset",
  "toolbar-sub-button-text":"black",
  "toolbar-sub-button-back":"white",
  "toolbar-sub-button-edge": "outset",
  "toolbar-sub-button-text-hover":"white",
  "toolbar-sub-button-back-hover":"grey",
  "toolbar-sub-button-edge-hover":"inset",
  "toolbar-palette-text":"black",
  "toolbar-palette-back":"white",
  "toolbar-palette-text-hover":"magenta",
  "toolbar-palette-back-hover":"white",

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
const light: ColorTheme = {
  "toolbar-back": "white",
  "toolbar-edge": "outset",
  "toolbar-button-back": "white",
  "toolbar-button-logos": "black",
  "toolbar-button-back-hover": "grey",
  "toolbar-button-logos-hover": "black",
  "toolbar-button-edge": "outset",
  "toolbar-button-edge-hover": "inset",
  "toolbar-dropdown-back": "white",
  "toolbar-dropdown-text": "black",
  "toolbar-dropdown-edge": "outset",
  "toolbar-hovernames-back": "white",
  "toolbar-hovernames-text": "black",
  "toolbar-hovernames-edge": "inset",
  "toolbar-slider-back": "grey",
  "toolbar-slider-back-edge": "inset",
  "toolbar-slider-thumb": "white",
  "toolbar-slider-thumb-edge": "outset",
  "toolbar-slider-back-hover": "black",
  "toolbar-slider-back-edge-hover": "inset",
  "toolbar-slider-thumb-hover": "grey",
  "toolbar-slider-thumb-edge-hover": "inset",
  "toolbar-charlimit": "black",
  "toolbar-charlimit-over": "magenta",
  "toolbar-charlimit-back": "white",
  "toolbar-charlimit-over-back": "white",
  "toolbar-input-text": "white",
  "toolbar-input-back": "grey",
  "toolbar-input-edge": "inset",
  "toolbar-publish-button-text": "black",
  "toolbar-publish-button-back": "white",
  "toolbar-publish-button-edge": "outset",
  "toolbar-publish-button-text-hover": "white",
  "toolbar-publish-button-back-hover": "grey",
  "toolbar-publish-button-edge-hover": "inset",
  "toolbar-sub-button-text":"black",
  "toolbar-sub-button-back":"white",
  "toolbar-sub-button-edge": "outset",
  "toolbar-sub-button-text-hover":"white",
  "toolbar-sub-button-back-hover":"grey",
  "toolbar-sub-button-edge-hover":"inset",
  "toolbar-palette-text":"black",
  "toolbar-palette-back":"white",
  "toolbar-palette-text-hover":"magenta",
  "toolbar-palette-back-hover":"white",

  "background-primary": "white",
  "background-code": "grey",
  "text-primary": "black",
  "text-secondary": "black",
  "text-tertiary": "black",
  "text-link": "grey",
  "text-negative": "grey",
  "divider": "grey",
  "scrollbar": "grey",
  "brush": "grey",
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
       case "light":
         for (const key in light) {
           const value = light[key as keyof typeof light];
           rootElement.style.setProperty(`--color-${key}`, value);
         }
         this.currentTheme = light;
         this.saveTheme();
         break;      
       case "dark":
         for (const key in dark) {
           const value = dark[key as keyof typeof dark];
           rootElement.style.setProperty(`--color-${key}`, value);
         }
         this.currentTheme = dark;
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
