export const BANNER_WIDTH = 96
export const BANNER_HEIGHT = 22
export const BANNER_FILL = "∙"

export const ICON_WIDTH = 6
export const ICON_HEIGHT = 3

export const MESSAGE_MAX_LENGTH = 5000
export const USERNAME_MAX_LENGTH = 64

export const RECONNECT_DELAY = 5000

export const ROOM_MAX_BIO = 280
export const PLAYER_MAX_BIO = 280
export const ITEM_MAX_BIO = 280
export const ITEM_MAX_TAGS = 280

export const DOOR_MAX_NAME = 32
export const ROOM_MAX_NAME = 32
export const PLAYER_MAX_NAME = 32
export const ITEM_MAX_NAME = 32

export const PAY_RATE = 50
export const PAY_TIME = 100000
export const DAILY_PAY = 100

export const GOLT = "✪"

export const DOOR_COST = 10
export const DOOR_MULTIPLIER = 2
export const DELETE_DOOR_COST = 10
export const ITEM_COST = 10
export const ROOM_COST = 20
export const TELEPORT_COST = 5
export const DELIVERY_COST = 2
export const SMELT_COST = 1

export const ENCHANT_MAX = 5000

export const AVATAR_WIDTH = 10
export const AVATAR_HEIGHT = 5
export const NPC_HEALTH = 1000

export interface colorPallete {
  code: string
  color: string
  rgb: { r: number, g: number, b: number }
}

export const colors: colorPallete[] = [
  {
    code: "A",
    color: "#f9f5ef",
    rgb: { r: 249,
      g: 245,
      b: 239 },
  },
  {
    code: "B",
    color: "#aabbbb",
    rgb: { r: 170,
      g: 187,
      b: 187 },
  },
  {
    code: "C",
    color: "#3388dd",
    rgb: { r: 51,
      g: 136,
      b: 221 },
  },
  {
    code: "D",
    color: "#2b2821",
    rgb: { r: 43,
      g: 40,
      b: 33 },
  },
  {
    code: "E",
    color: "#ffff33",
    rgb: { r: 255,
      g: 255,
      b: 51 },
  },
  {
    code: "F",
    color: "#efb775",
    rgb: { r: 239,
      g: 183,
      b: 117 },
  },
  {
    code: "G",
    color: "#dd7711",
    rgb: { r: 221,
      g: 119,
      b: 17 },
  },
  {
    code: "H",
    color: "#9b1a0a",
    rgb: { r: 155,
      g: 26,
      b: 10 },
  },
  {
    code: "I",
    color: "#bbce93",
    rgb: { r: 187,
      g: 206,
      b: 147 },
  },
  {
    code: "J",
    color: "#62b568",
    rgb: { r: 98,
      g: 181,
      b: 104 },
  },
  {
    code: "K",
    color: "#2f844e",
    rgb: { r: 47,
      g: 132,
      b: 78 },
  },
  {
    code: "L",
    color: "#2d6351",
    rgb: { r: 45,
      g: 99,
      b: 81 },
  },
  {
    code: "M",
    color: "#c9688a",
    rgb: { r: 201,
      g: 104,
      b: 138 },
  },
  {
    code: "N",
    color: "#6a436c",
    rgb: { r: 106,
      g: 67,
      b: 108 },
  },
  {
    code: "O",
    color: "#403550",
    rgb: { r: 64,
      g: 53,
      b: 80 },
  },
  {
    code: "P",
    color: "#433900",
    rgb: { r: 67,
      g: 57,
      b: 0 },
  },
];


export interface itemRarityInterface {
  num: number
  col: string
  back: string
  shadow: string
  name: string
}
//icon back
//drop shadow, font
//rarity names (uncommon, rare, legendary, mythical etc)

export const itemRarity: itemRarityInterface[] = [
  {
    num:0,
    col:"",
    back:"none",
    shadow:"2px 1px 1px rgba(0, 30, 255, 0.5), -2px 1px 1px rgba(255,0,80,0.5)",
    name:"uncommon",
  },
  {
    num:1,
    col:colors[4].color,
    back:colors[9].color,
    shadow:"2px 1px 1px rgba(0, 30, 255, 0.5), -2px 1px 1px rgba(255,0,80,0.5), 0 0 3px",
    name:"rare",
  },
  {
    num:2,
    col:colors[0].color,
    back:colors[2].color,
    shadow:"2px 1px 1px rgba(0, 30, 255, 0.5), -2px 1px 1px rgba(255,0,80,0.5), 0 0 3px",
    name:"epic",
  },
  {
    num:3,
    col:"yellow",
    back:"orange",
    shadow:"2px 1px 1px rgba(0, 30, 255, 0.5), -2px 1px 1px rgba(255,0,80,0.5), 0 0 3px",
    name:"legendary",
  },
  {
    num:4,
    col:"green",
    back:"lightgreen",
    shadow:"2px 1px 1px rgba(0, 30, 255, 0.5), -2px 1px 1px rgba(255,0,80,0.5), 0 0 3px",
    name:"mythic",
  },
  {
    num:5,
    col:"purple",
    back:"pink",
    shadow:"2px 1px 1px rgba(0, 30, 255, 0.5), -2px 1px 1px rgba(255,0,80,0.5), 0 0 3px",
    name:"",
  },
  {
    num:6,
    col:"cyan",
    back:"magenta",
    shadow:"2px 1px 1px rgba(0, 30, 255, 0.5), -2px 1px 1px rgba(255,0,80,0.5), 0 0 3px",
    name:"",
  },
  {
    num:7,
    col:"yellow",
    back:"white",
    shadow:"2px 1px 1px rgba(0, 30, 255, 0.5), -2px 1px 1px rgba(255,0,80,0.5), 0 0 3px",
    name:"",
  },
]
