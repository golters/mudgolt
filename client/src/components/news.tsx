export interface newsType {
  name: string
  date: string
  text: string
}

export const news: newsType[] = [
  {
  name:"Color update!",
  date:"17/12/2023",
  text:"We added color brushes to the banner art for you to further explore your creativity with."
  },
  {
    name:"Chat update!",
    date:"14/12/2023",
    text:"You can now click on other users names and items to interact with them in the chat."
  },
  {
    name:"Forager update!",
    date:"02/12/2023",
    text:"Find unique bugs and plants through exploring empty rooms. With new item rarity some bugs and plants are more special than others."
  },
  {
    name:"Side bar update!",
    date:"02/12/2023",
    text:"We added side bars for easier navigation. Items now have customisable icons in your inventory tab, See your whispers better in the inbox tab, and craft items/doors/rooms with new crafting menus. Please send us your feedback on the new layout and how it could be improved."
  },
]
