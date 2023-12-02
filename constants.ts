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

export interface itemRarityInterface {
  num: number
  col: string
  back: string
}
//drop shadow, font
//rarity names (uncommon, rare, legendary, mythical etc)

export const itemRarity: itemRarityInterface[] = [
  {
    num:0,
    col:"white",
    back:"",
  },
  {
    num:1,
    col:"yellow",
    back:"black",
  },
  {
    num:2,
    col:"white",
    back:"blue",
  },
  {
    num:3,
    col:"yellow",
    back:"orange",
  },
  {
    num:4,
    col:"green",
    back:"lightgreen",
  },
  {
    num:5,
    col:"purple",
    back:"pink",
  },
  {
    num:6,
    col:"cyan",
    back:"magenta",
  },
  {
    num:7,
    col:"yellow",
    back:"white",
  },
]
