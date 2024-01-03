export interface ColorTheme {
  "name": string
  "toolbar-back": string
  "toolbar-edge": string
  "toolbar-title": string
  "toolbar-button-back": string
  "toolbar-button-logos": string
  "toolbar-button-back-hover": string
  "toolbar-button-logos-hover": string
  "toolbar-button-edge": string
  "toolbar-button-edge-hover": string
  "toolbar-dropdown-back": string
  "toolbar-dropdown-text": string
  "toolbar-dropdown-edge": string
  "toolbar-dropdown-shadow":string
  "toolbar-hovernames-back": string
  "toolbar-hovernames-text": string
  "toolbar-hovernames-edge": string
  "toolbar-slider-back": string
  "toolbar-slider-back-edge": string
  "toolbar-slider-thumb": string
  "toolbar-slider-thumb-edge": string
  "toolbar-slider-back-hover": string
  "toolbar-slider-back-edge-hover": string
  "toolbar-slider-thumb-hover": string
  "toolbar-slider-thumb-edge-hover": string
  "toolbar-charlimit": string
  "toolbar-charlimit-over": string
  "toolbar-charlimit-back": string
  "toolbar-charlimit-over-back": string
  "toolbar-input-text":string
  "toolbar-input-back":string
  "toolbar-input-edge":string
  "toolbar-publish-button-text":string
  "toolbar-publish-button-back":string
  "toolbar-publish-button-edge":string
  "toolbar-publish-button-text-hover":string
  "toolbar-publish-button-back-hover":string
  "toolbar-publish-button-edge-hover":string
  "toolbar-sub-button-text":string
  "toolbar-sub-button-back":string
  "toolbar-sub-button-edge":string
  "toolbar-sub-button-text-hover":string
  "toolbar-sub-button-back-hover":string
  "toolbar-sub-button-edge-hover":string
  "toolbar-palette-text":string
  "toolbar-palette-back":string
  "toolbar-palette-text-hover":string
  "toolbar-palette-back-hover":string
  
  "banner-line":string
  "banner-mini":string
  "banner-mini-edge":string
  "banner-mini-back":string  
  "banner-mini-hover":string
  "banner-mini-edge-hover":string
  "banner-mini-back-hover":string  
  "banner-type":string
  "banner-type-back":string
  "banner-type-edge":string
  "banner-type-hover":string
  "banner-type-back-hover":string
  "banner-type-edge-hover":string
  "banner-type-select":string
  "banner-type-select-back":string
  "banner-type-select-back-edge":string
  "banner-color":string
  "banner-back":string
  "banner-border":string
  "banner-cursor":string
  "banner-cursor-back":string
  "banner-room-name":string

  "terminal-back":string
  "text-primary": string
  "text-link": string
  "chat-date":string
  "chat-name":string
  "chat-message":string
  "chat-error":string
  "charlimit": string
  "charlimit-over": string
  "input-text": string
  "input-back": string
  "input-back-edge": string 

  "scrollbar-back":string
  "scrollbar-thumb":string
  "scrollbar-back-edge":string
  "scrollbar-thumb-edge":string

  "background-primary": string
  "background-code": string
  "divider": string
  "background-gradient": string

  "sidebar-back":string
  "sidebar-text":string
  "sidebar-border":string
  "sidebar-shadow":string
  "rightbar-back":string
  "rightbar-text":string
  "rightbar-border":string
  "rightbar-shadow":string

  "inventory-icon-text":string
  "inventory-icon-back":string
  "inventory-icon-border":string
  "inventory-icon-cursor-text":string
  "inventory-icon-cursor-back":string

  "inbox-back":string
  "inbox-sent-text":string
  "inbox-sent-back":string
  "inbox-sent-date":string
  "inbox-sent-name":string
  "inbox-received-text":string
  "inbox-received-back":string
  "inbox-received-date":string
  "inbox-received-name":string

  "window-back":string
  "window-text":string
  "window-border":string
  "window-shadow":string
  "window-bar-text":string
  "window-bar-back":string
  "window-close-hover-text":string
  "window-close-hover-back":string
  "npc-text":string
  "npc-back":string
  "npc-border":string
  "npc-cursor-text":string
  "npc-cursor-back":string
  "npc-title-text":string
  "npc-title-back":string
  "npc-title-border":string
  "npc-name-text":string
  "npc-name-back":string
  "npc-message-text":string
  "npc-message-back":string
  "npc-phrase-back":string
  "npc-phrase-border":string
  "cluster-text":string
  "cluster-back":string
}


export const VALID_COLOR_KEYS = [
  "name",
  "toolbar-back",
  "toolbar-edge",
  "toolbar-title",
  "toolbar-button-back",
  "toolbar-button-logos",
  "toolbar-button-back-hover",
  "toolbar-button-logos-hover",
  "toolbar-button-edge",
  "toolbar-button-edge-hover",
  "toolbar-dropdown-back",
  "toolbar-dropdown-text",
  "toolbar-dropdown-edge",
  "toolbar-dropdown-shadow",
  "toolbar-hovernames-back",
  "toolbar-hovernames-text",
  "toolbar-hovernames-edge",
  "toolbar-slider-back",
  "toolbar-slider-back-edge",
  "toolbar-slider-thumb",
  "toolbar-slider-thumb-edge",
  "toolbar-slider-back-hover",
  "toolbar-slider-back-edge-hover",
  "toolbar-slider-thumb-hover",
  "toolbar-slider-thumb-edge-hover",
  "toolbar-charlimit",
  "toolbar-charlimit-over",
  "toolbar-charlimit-back",
  "toolbar-charlimit-over-back",
  "toolbar-input-text",
  "toolbar-input-back",
  "toolbar-input-edge",
  "toolbar-publish-button-text",
  "toolbar-publish-button-back",
  "toolbar-publish-button-edge",
  "toolbar-publish-button-text-hover",
  "toolbar-publish-button-back-hover",
  "toolbar-publish-button-edge-hover",
  "toolbar-sub-button-text",
  "toolbar-sub-button-back",
  "toolbar-sub-button-edge",
  "toolbar-sub-button-text-hover",
  "toolbar-sub-button-back-hover",
  "toolbar-sub-button-edge-hover",
  "toolbar-palette-text",
  "toolbar-palette-back",
  "toolbar-palette-text-hover",
  "toolbar-palette-back-hover",
  "banner-line",
  "banner-mini",
  "banner-mini-edge",
  "banner-mini-back", 
  "banner-mini-hover",
  "banner-mini-edge-hover",
  "banner-mini-back-hover", 
  "banner-type",
  "banner-type-back",
  "banner-type-edge",
  "banner-type-hover",
  "banner-type-back-hover",
  "banner-type-edge-hover",
  "banner-type-select",
  "banner-type-select-back",
  "banner-type-select-back-edge",
  "banner-color",
  "banner-back",
  "banner-border",
  "banner-cursor",
  "banner-cursor-back",
  "banner-room-name",
  "terminal-back",
  "text-primary",
  "text-link",
  "chat-date",
  "chat-name",
  "chat-message",
  "chat-error",
  "charlimit",
  "charlimit-over",
  "input-text",
  "input-back",
  "input-back-edge",
  "scrollbar-back",
  "scrollbar-thumb",
  "scrollbar-back-edge",
  "scrollbar-thumb-edge",
  "background-primary",
  "background-code",
  "divider",
];
