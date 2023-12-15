export const BANNER_WIDTH = 96
export const BANNER_HEIGHT = 16
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
}

export const colors: colorPallete[] = [
  {
    code:"A",
    color:"#F9F5EF",
  },{
    code:"B",
    color:"#8A8FC4",
  },{
    code:"C",
    color:"#E3D245",
  },{
    code:"D",
    color:"#F0D472",
  },{
    code:"E",
    color:"#D88038",
  },{
    code:"F",
    color:"#A13D3B",
  },{
    code:"G",
    color:"#4E282E",
  },{
    code:"H",
    color:"#9A407E",
  },{
    code:"I",
    color:"#47416B",
  },{
    code:"J",
    color:"#6C8C50",
  },{
    code:"K",
    color:"grey",
  },{
    code:"L",
    color:"black",
  },
]

export interface itemRarityInterface {
  num: number
  col: string
  back: string
  shadow: string
  name: string
}
//drop shadow, font
//rarity names (uncommon, rare, legendary, mythical etc)

export const itemRarity: itemRarityInterface[] = [
  {
    num:0,
    col:"white",
    back:"",
    shadow:"2px 1px 1px rgba(0, 30, 255, 0.5), -2px 1px 1px rgba(255,0,80,0.5), 0 0 3px",
    name:"uncommon",
  },
  {
    num:1,
    col:colors[3].color,
    back:colors[9].color,
    shadow:"2px 1px 1px rgba(0, 30, 255, 0.5), -2px 1px 1px rgba(255,0,80,0.5), 0 0 3px",
    name:"rare",
  },
  {
    num:2,
    col:colors[2].color,
    back:colors[1].color,
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
