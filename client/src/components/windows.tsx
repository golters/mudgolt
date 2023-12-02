import "./Toolbar.css"
import { sendEvent } from "../network"
import {
  ROOM_DESCRIBE_EVENT,
  ENCHANT_ITEM_EVENT,
  MAKE_EVENT,
  DRAW_AVATAR_EVENT,
  SEND_EVENT,
  TAG_ITEM_EVENT,
  WHISPER_EVENT,
} from "../../../events"
import {
  Door, Item, Npc, Chat,
} from "../../../@types"
import { MESSAGE_MAX_LENGTH, AVATAR_HEIGHT, AVATAR_WIDTH } from '../../../constants'
import{
  setBrush,
}from "./Header"

export function newMesageWindow(Message: string, user:string, npcs: Npc[] | null){
  let windows = document.getElementById('windows')
  windows?.childNodes.forEach(element => {
    if((element as HTMLElement).style.width === "0.1px"){
    element.remove()
    }
  });
  if(windows){
    const head = document.createElement('div')
    head.appendChild(document.createTextNode('Drag Me...'))
    const window = document.createElement('div')
    head.setAttribute('id','windowheader')
    window.setAttribute('id','window')
    const x = document.createElement('div')
    x.appendChild(document.createTextNode('X'))
    x.setAttribute('id','close')
    windows.appendChild(window)
    window.appendChild(head)
    dragElement(window);
    head.appendChild(x)
    x.onclick = function () {closeWindow(window)}    
    window.style.top = (windows?.childNodes.length * 10) + "px";
    window.style.left = (windows?.childNodes.length * 10) + "px";

    const menu = document.createElement('div')
    menu.setAttribute('id','menu')
    const message = document.createElement('div')
    if(Message && user)
    message.appendChild(document.createTextNode("["+user+"] "+Message))
    menu.appendChild(message)
    menu.appendChild(document.createTextNode("Reply"))
    const reply = document.createElement('input')
    reply.setAttribute('id','input')
    reply.setAttribute('value',"nice!")
    menu.appendChild(reply)
    const button8 = document.createElement('input')
    button8.setAttribute('type','submit')
    button8.onclick = function () {replyMessage(user, reply.value.toString(),window)}
    menu.appendChild(button8)  
    window.appendChild(menu)
    
  }

}

export function newReplyWindow(Message: Chat | null, npcs: Npc[] | null){
  let windows = document.getElementById('windows')
  windows?.childNodes.forEach(element => {
    if((element as HTMLElement).style.width === "0.1px"){
    element.remove()
    }
  });
  if(windows){
    const head = document.createElement('div')
    head.appendChild(document.createTextNode('Drag Me...'))
    const window = document.createElement('div')
    head.setAttribute('id','windowheader')
    window.setAttribute('id','window')
    const x = document.createElement('div')
    x.appendChild(document.createTextNode('X'))
    x.setAttribute('id','close')
    windows.appendChild(window)
    window.appendChild(head)
    dragElement(window);
    head.appendChild(x)
    x.onclick = function () {closeWindow(window)}    
    window.style.top = (windows?.childNodes.length * 10) + "px";
    window.style.left = (windows?.childNodes.length * 10) + "px";
    //get npc   
    let job = "hobo"

    const menu = document.createElement('div')
    menu.setAttribute('id','menu')
    if(Message === null)
    return
    const person = document.createElement('div')
    if(Message?.player.username)
    person.appendChild(document.createTextNode(Message?.player.username))
    menu.appendChild(document.createTextNode("Reply"))
    menu.appendChild(person)
    const message = document.createElement('input')
    message.setAttribute('id','input')
    message.setAttribute('value',"nice!")
    menu.appendChild(message)
    const button8 = document.createElement('input')
    button8.setAttribute('type','submit')
    const user = Message?.player.username
    if(user)
    button8.onclick = function () {replyMessage(user, message.value.toString(),window)}
    menu.appendChild(button8)  
    
    job = "courier"
    window.appendChild(menu)
    let npc: Npc[] = []
    if(npcs){   
       npc = npcs.filter(npc => {
        return npc.job === job
      })      
    }
    addNPC(window, npc)
  }

}

export function newCraftWindow(Type: string | null, Item: Item | null, npcs: Npc[] | null){
  let windows = document.getElementById('windows')
  windows?.childNodes.forEach(element => {
    if((element as HTMLElement).style.width === "0.1px"){
    element.remove()
    }
  });
  if(windows){
    const head = document.createElement('div')
    head.appendChild(document.createTextNode('Drag Me...'))
    const window = document.createElement('div')
    head.setAttribute('id','windowheader')
    window.setAttribute('id','window')
    const x = document.createElement('div')
    x.appendChild(document.createTextNode('X'))
    x.setAttribute('id','close')
    windows.appendChild(window)
    window.appendChild(head)
    dragElement(window);
    head.appendChild(x)
    x.onclick = function () {closeWindow(window)}    
    window.style.top = (windows?.childNodes.length * 10) + "px";
    window.style.left = (windows?.childNodes.length * 10) + "px";
    //get npc   
    let job = "hobo"

    const menu = document.createElement('div')
    menu.setAttribute('id','menu')
    switch(Type) {
      case "Describe":
        if(Item === null){
           
          break;
        }        
        menu.appendChild(document.createTextNode('describe'))
        const description = document.createElement('input')
        description.setAttribute('id','input')
        description.setAttribute('value',`${Item.description}`)
        menu.appendChild(description)
        const button1 = document.createElement('input')
        button1.setAttribute('type','submit')
        button1.onclick = function () {describeItem(Item,description.value.toString(),window)}
        menu.appendChild(button1)
        job = "scribe"

        break;
      case "Enchant":
        if(Item === null){
           
          break;
        }
        menu.appendChild(document.createTextNode('Enchant'))
        const enchantment = document.createElement('input')
        enchantment.setAttribute('id','input')
        enchantment.setAttribute('value',`${Item.macro}`)
        menu.appendChild(enchantment)
        const button2 = document.createElement('input')
        button2.setAttribute('type','submit')
        button2.onclick = function () {enchantItem(Item,enchantment.value.toString(),window)}
        menu.appendChild(button2)
        job = "enchanter"

        break;
      case "makeItem":
        const itemName = document.createElement('input')
        itemName.setAttribute('id','input')
        itemName.setAttribute('value',"sword")
        menu.appendChild(document.createTextNode("name"))
        menu.appendChild(itemName)
        const itemDescription = document.createElement('input')
        itemDescription.setAttribute('id','input')
        itemDescription.setAttribute('value','a simple sword')
        menu.appendChild(document.createTextNode("Description"))
        menu.appendChild(itemDescription)
        const itemMacro = document.createElement('input')
        itemMacro.setAttribute('id','input')
        itemMacro.setAttribute('value','swings sword')
        menu.appendChild(document.createTextNode("Enchantment"))
        menu.appendChild(itemMacro)
        const button3 = document.createElement('input')
        button3.setAttribute('type','submit')
        button3.onclick = function () {makeItem(itemName.value.toString(),itemDescription.value.toString(),itemMacro.value.toString(),window)}
        menu.appendChild(button3)
        job = "blacksmith"

        break;
      case "makeRoom":
        const roomName = document.createElement('input')
        roomName.setAttribute('id','input')
        roomName.setAttribute('value',"room...")
        menu.appendChild(document.createTextNode("name"))
        menu.appendChild(roomName)
        const roomDescription = document.createElement('input')
        roomDescription.setAttribute('id','input')
        roomDescription.setAttribute('value','a room...')
        menu.appendChild(document.createTextNode("Description"))
        menu.appendChild(roomDescription)
        const button4 = document.createElement('input')
        button4.setAttribute('type','submit')
        button4.onclick = function () {makeRoom(roomName.value.toString(),roomDescription.value.toString(),window)}
        menu.appendChild(button4)
        job = "builder"

        break;
      case "makeDoor":
        const doorName = document.createElement('input')
        doorName.setAttribute('id','input')
        doorName.setAttribute('value',"door...")
        menu.appendChild(document.createTextNode("name"))
        menu.appendChild(doorName)
        const destination = document.createElement('input')
        destination.setAttribute('id','input')
        destination.setAttribute('value',"destination...")
        menu.appendChild(document.createTextNode("destination"))
        menu.appendChild(destination)
        const button5 = document.createElement('input')
        button5.setAttribute('type','submit')
        button5.onclick = function () {makeDoor(doorName.value.toString(),destination.value.toString(),window)}
        menu.appendChild(button5)
        job = "carpenter"

        break;
      case "Tag":
        if(Item === null){
           
          break;
        }
        const cluster = document.createElement('div')
        cluster.className = "cluster"
        if(Item.tags){
        const tags = Item.tags.split(",")
        for (let t = 0; t < tags.length; t++){
          const clustercontent = document.createElement('div')
          clustercontent.className = "clustercontent"
          const tag = document.createElement('div')
          tag.appendChild(document.createTextNode(tags[t]))
          clustercontent.appendChild(tag)
          const remove = document.createElement('div')
          remove.appendChild(document.createTextNode("(x)"))
          remove.onclick = function () {removeItemTag(clustercontent)}
          tag.appendChild(remove)
          cluster.appendChild(clustercontent)
        }
        }
        menu.appendChild(cluster)
        const taginput = document.createElement('input')
        taginput.setAttribute('id','input')
        menu.appendChild(taginput)
        
        const button6 = document.createElement('input')
        button6.setAttribute('type','submit')
        button6.onclick = function () {tagItem(Item.name, cluster, taginput.value.toString(), window)}
        menu.appendChild(button6)
        job = "librarian"
        break;
      case "Send":  
      if(Item === null){
         
        break;
      }
        const sendItem = document.createElement('div')
        sendItem.appendChild(document.createTextNode(Item?.name))
        menu.appendChild(document.createTextNode("Item"))
        menu.appendChild(sendItem)
        const recipient = document.createElement('input')
        recipient.setAttribute('id','input')
        recipient.setAttribute('value',"user...")
        menu.appendChild(document.createTextNode("Recipient"))
        menu.appendChild(recipient)
        const button7 = document.createElement('input')
        button7.setAttribute('type','submit')
        button7.onclick = function () {sendItemEvent(Item?.name,recipient.value.toString(),window)}
        menu.appendChild(button7)  
        job = "courier"
        break;
      default:
        menu.appendChild(document.createTextNode('nothing'))
        //put something funny here

        job = "hobo"

        break;
    }
    window.appendChild(menu)
    let npc: Npc[] = []
    if(npcs){   
       npc = npcs.filter(npc => {
        return npc.job === job
      })      
    }
    addNPC(window, npc)
  }
}

function addNPC(window: HTMLElement, npc: Npc[]){
  const guy = document.createElement('div')
  guy.setAttribute('id','menu')
  guy.appendChild(document.createTextNode(npc[0].name + " the " + npc[0].job))
  window.appendChild(guy)
  const avatar = document.createElement('div')
  guy.appendChild(avatar)
  const iconbits = npc[0].icon.split("")
  for(let y = 0; y < AVATAR_HEIGHT; y++){
    const iconrow = document.createElement('span')
    for(let x = 0; x < AVATAR_WIDTH; x++){
        const char = document.createElement('span')
        //char.appendChild(document.createTextNode(iconbits[x+(ICON_WIDTH*y)]))
        char.innerHTML = `${iconbits[x+(AVATAR_WIDTH*y)]}`
        iconrow.appendChild(char)
        char.onmouseleave = function () {char.innerHTML = `${iconbits[x+(AVATAR_WIDTH*y)]}`}
        char.onmouseover = function () {char.innerHTML = `${localStorage.brush}`}
        char.onclick = function () {drawAvatar(npc[0],x,y,localStorage.brush)}
        char.oncontextmenu = function () {setBrush(iconbits[x+(AVATAR_WIDTH*y)])}
    }
      avatar.appendChild(iconrow)
      iconrow.appendChild(document.createElement('br'))
  }
  const phrase = document.createElement('div')
  phrase.appendChild(document.createTextNode("["+npc[0].name+"] "+npc[0].phrases[Math.floor(Math.random() * (npc[0].phrases.length))]))
  guy.appendChild(phrase)
  window.appendChild(guy)
  avatar.classList.add('icon')

}

export function closeWindow(window: HTMLElement) {
  window.innerHTML = ""
  window.style.transition = "0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045)"
  window.style.opacity = "0.1"
  window.style.width = "0.1px"
  window.style.height = "0.1px"
}
export function dragElement(elmnt: HTMLElement) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  //const header = document.getElementById(elmnt.id + "header")
  const header = elmnt.firstElementChild as HTMLElement
  const windows = elmnt.parentElement
  if (header) {
    /* if present, the header is where you move the DIV from:*/
    header.onmousedown = dragMouseDown;
  } else {
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e: MouseEvent) {
    if(e.target === header){
    e = e || window.event;
    e.preventDefault();
    windows?.appendChild(elmnt)
    elmnt.style.cursor = "grabbing"
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
    elmnt.style.transition = "0s"
    }    
  }

  function elementDrag(e: MouseEvent) {
    if(Math.random() * 1000 < 1){
      header.childNodes[0].nodeValue = "put me down!!!"
    }
    e = e || window.event;
    e.preventDefault();
    elmnt.style.cursor = "grabbing"
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    if(header.childNodes[0].nodeValue === "put me down!!!"){
      header.childNodes[0].nodeValue = "thank you..."
    }
    document.onmouseup = null;
    document.onmousemove = null;
    const top = Math.ceil((elmnt.offsetTop - pos2 - 5) / 10) * 10
    const left = Math.ceil((elmnt.offsetLeft - pos1 - 5) / 10) * 10
    elmnt.style.top = top + "px"
    elmnt.style.left = left + "px"
    elmnt.style.cursor = "auto"
    elmnt.style.transition = "1s"
  }
}
function drawAvatar(npc: Npc, x: number, y: number, brush: string){
  sendEvent(DRAW_AVATAR_EVENT, [x,y,brush, npc])
}

function describeItem(item: Item, description: String, window: HTMLElement){
  sendEvent(ROOM_DESCRIBE_EVENT, [item.name, description])
  window.innerHTML = ""
  window.style.transition = "0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045)"
  window.style.opacity = "0.1"
  window.style.width = "0.1px"
  window.style.height = "0.1px"
}
function enchantItem(item: Item, macro: String, window: HTMLElement){
  sendEvent(ENCHANT_ITEM_EVENT, [item.name, macro])
  window.innerHTML = ""
  window.style.transition = "0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045)"
  window.style.opacity = "0.1"
  window.style.width = "0.1px"
  window.style.height = "0.1px"
}
function makeItem(name: string, description: string, macro: string, window: HTMLElement){
  sendEvent(MAKE_EVENT, ["item",name,description,macro])
  window.innerHTML = ""
  window.style.transition = "0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045)"
  window.style.opacity = "0.1"
  window.style.width = "0.1px"
  window.style.height = "0.1px"
}
function makeRoom(name: string, description: string, window: HTMLElement){
  sendEvent(MAKE_EVENT, ["room",name,description])
  window.innerHTML = ""
  window.style.transition = "0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045)"
  window.style.opacity = "0.1"
  window.style.width = "0.1px"
  window.style.height = "0.1px"
}
function makeDoor(name: string, room: string, window: HTMLElement){
  sendEvent(MAKE_EVENT, ["door",name,room])
  window.innerHTML = ""
  window.style.transition = "0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045)"
  window.style.opacity = "0.1"
  window.style.width = "0.1px"
  window.style.height = "0.1px"
}

function sendItemEvent(item: string, user:string, window: HTMLElement){
  sendEvent(SEND_EVENT, [item,user])
  window.innerHTML = ""
  window.style.transition = "0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045)"
  window.style.opacity = "0.1"
  window.style.width = "0.1px"
  window.style.height = "0.1px"
}

function tagItem(item:string, cluster: HTMLElement, newtags:string, window: HTMLElement){
  const oldtags: string[] = []
  for(let t = 0; t < cluster.children.length; t++){
    const name = cluster.childNodes[t].childNodes[0].textContent
    if(name)
    oldtags.push(name.slice(0,-3))
  }
  let tags = newtags 
  if(oldtags.length > 0 && newtags != "") 
  tags = newtags + ","
  tags = tags + oldtags.join(",")
  sendEvent(TAG_ITEM_EVENT, [item, tags])
  window.innerHTML = ""
  window.style.transition = "0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045)"
  window.style.opacity = "0.1"
  window.style.width = "0.1px"
  window.style.height = "0.1px"
}

function removeItemTag(removeelm: HTMLElement){
  removeelm.remove()
}

function replyMessage(user: string, newMessage: string, window: HTMLElement){
  sendEvent(WHISPER_EVENT, [user, newMessage])
  window.innerHTML = ""
  window.style.transition = "0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045)"
  window.style.opacity = "0.1"
  window.style.width = "0.1px"
  window.style.height = "0.1px"
}

export function redrawAvatars(boys: Npc[]){
  let windows = document.getElementById('windows')
  if(windows){
    const menus = windows.children
    for(let m = 0; m < menus.length;m++){
      const guy = menus[m].childNodes[2].childNodes[1] as HTMLElement
      const npc = menus[m].childNodes[2] as HTMLElement
      const face = boys?.find((n) => {
        if(npc)
        return  npc.innerHTML.toString().includes(n.name + " the " + n.job)
      })
      if(face){
      guy.innerHTML = ""
      const avatar = document.createElement('div')
      const iconbits = face?.icon.split("")
      if(iconbits)
      for(let y = 0; y < AVATAR_HEIGHT; y++){
        const iconrow = document.createElement('span')
        for(let x = 0; x < AVATAR_WIDTH; x++){
            const char = document.createElement('span')
            char.innerHTML = `${iconbits[x+(AVATAR_WIDTH*y)]}`
            iconrow.appendChild(char)
            char.onmouseleave = function () {char.innerHTML = `${iconbits[x+(AVATAR_WIDTH*y)]}`}
            char.onmouseover = function () {char.innerHTML = `${localStorage.brush}`}
            char.onclick = function () {drawAvatar(face,x,y,localStorage.brush)}
            char.oncontextmenu = function () {setBrush(iconbits[x+(AVATAR_WIDTH*y)])}
        }
          guy.appendChild(iconrow)
          iconrow.appendChild(document.createElement('br'))
      }
    }
    }
  }

}