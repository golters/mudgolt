import * as THREE from "three";
import { getCharTexture,camera,renderer,scene } from "./Header";
import { dragging, pointer,dragOffset,dragEvent } from "./canvasManager";
import { networkEmitter } from "../network/events";
import { NPC_UPDATE_EVENT,WINDOW_EVENT,DOOR_UPDATE_EVENT } from "../../../events";
import {
  Npc,
} from "../../../@types"
import { AVATAR_HEIGHT, AVATAR_WIDTH } from "../../../constants";

export let windows = 0;

let npcs;

networkEmitter.on(NPC_UPDATE_EVENT, (Npcs: Npc[]) => {
  console.log("npcs udpate")
  npcs = Npcs
});


function animateTransition(window, visible = true, time){
  const r = window.userData.rows;
  const c =  window.userData.cols;
  const cx = (c - 1) / 2;
  const cy = (r - 1) / 2;
  const rand = Math.floor(Math.random() * 13);
  switch(rand){
    case 0:
      for (let x = 0; x < c; x++) {
        for (let y = 0; y < r; y++) {
          if(visible == false){
            window.children[((x * r) + y) * 2].userData.isBlock = false;
            window.children[((x * r) + y) * 2 + 1].userData.isBlock = false;
            window.children[((x * r) + y) * 2].userData.isDrag = false;
            window.children[((x * r) + y) * 2 + 1].userData.isDrag = false;
            window.children[((x * r) + y) * 2].userData.isClick = false;
            window.children[((x * r) + y) * 2 + 1].userData.isClick = false;
          }
          const dist = Math.hypot(x - cx, y - cy);
          const delay = time * dist + Math.random();
          setTimeout(() => {
            window.children[((x * r) + y) * 2].visible = visible;
            window.children[((x * r) + y) * 2 + 1].visible = visible;
          }, delay);
        }
      }
      break;
    case 1:
      for (let x = 0; x < c; x++) {
        for (let y = 0; y < r; y++) {
          if(visible == false){
            window.children[((x * r) + y) * 2].userData.isBlock = false;
            window.children[((x * r) + y) * 2 + 1].userData.isBlock = false;
            window.children[((x * r) + y) * 2].userData.isDrag = false;
            window.children[((x * r) + y) * 2 + 1].userData.isDrag = false;
            window.children[((x * r) + y) * 2].userData.isClick = false;
            window.children[((x * r) + y) * 2 + 1].userData.isClick = false;
          }
          setTimeout(() => {
            window.children[((x * r) + y) * 2].visible = visible;
            window.children[((x * r) + y) * 2 + 1].visible = visible;
          },
          time * x);
        }
      }
      break;
    case 2:
      for (let x = c - 1; x >= 0; x--) {
        for (let y = 0; y < r; y++) {
          if(visible == false){
            window.children[((x * r) + y) * 2].userData.isBlock = false;
            window.children[((x * r) + y) * 2 + 1].userData.isBlock = false;
            window.children[((x * r) + y) * 2].userData.isDrag = false;
            window.children[((x * r) + y) * 2 + 1].userData.isDrag = false;
            window.children[((x * r) + y) * 2].userData.isClick = false;
            window.children[((x * r) + y) * 2 + 1].userData.isClick = false;
          }
          setTimeout(() => {
            window.children[((x * r) + y) * 2].visible = visible;
            window.children[((x * r) + y) * 2 + 1].visible = visible;
          }, time * (c - 1 - x));
        }
      }
      break;
    case 3:
      for (let y = 0; y < r; y++) {
        for (let x = 0; x < c; x++) {
          if(visible == false){
            window.children[((x * r) + y) * 2].userData.isBlock = false;
            window.children[((x * r) + y) * 2 + 1].userData.isBlock = false;
            window.children[((x * r) + y) * 2].userData.isDrag = false;
            window.children[((x * r) + y) * 2 + 1].userData.isDrag = false;
            window.children[((x * r) + y) * 2].userData.isClick = false;
            window.children[((x * r) + y) * 2 + 1].userData.isClick = false;
          }
          setTimeout(() => {
            window.children[((x * r) + y) * 2].visible = visible;
            window.children[((x * r) + y) * 2 + 1].visible = visible;
          }, time * y);
        }
      }
      break;
    case 4:
      for (let y = r - 1; y >= 0; y--) {
        for (let x = 0; x < c; x++) {
          if(visible == false){
            window.children[((x * r) + y) * 2].userData.isBlock = false;
            window.children[((x * r) + y) * 2 + 1].userData.isBlock = false;
            window.children[((x * r) + y) * 2].userData.isDrag = false;
            window.children[((x * r) + y) * 2 + 1].userData.isDrag = false;
            window.children[((x * r) + y) * 2].userData.isClick = false;
            window.children[((x * r) + y) * 2 + 1].userData.isClick = false;
          }
          setTimeout(() => {
            window.children[((x * r) + y) * 2].visible = visible;
            window.children[((x * r) + y) * 2 + 1].visible = visible;
          }, time * (r - 1 - y));
        }
      }
      break;
    case 5:
      for (let x = 0; x < c; x++) {
        for (let y = 0; y < r; y++) {
          if(visible == false){
            window.children[((x * r) + y) * 2].userData.isBlock = false;
            window.children[((x * r) + y) * 2 + 1].userData.isBlock = false;
            window.children[((x * r) + y) * 2].userData.isDrag = false;
            window.children[((x * r) + y) * 2 + 1].userData.isDrag = false;
            window.children[((x * r) + y) * 2].userData.isClick = false;
            window.children[((x * r) + y) * 2 + 1].userData.isClick = false;
          }
          setTimeout(() => {
            window.children[((x * r) + y) * 2].visible = visible;
            window.children[((x * r) + y) * 2 + 1].visible = visible;
          }, time * (x + y));
        }
      }
      break;
    case 6:

      for (let x = 0; x < c; x++) {
        for (let y = 0; y < r; y++) {
          if(visible == false){
            window.children[((x * r) + y) * 2].userData.isBlock = false;
            window.children[((x * r) + y) * 2 + 1].userData.isBlock = false;
            window.children[((x * r) + y) * 2].userData.isDrag = false;
            window.children[((x * r) + y) * 2 + 1].userData.isDrag = false;
            window.children[((x * r) + y) * 2].userData.isClick = false;
            window.children[((x * r) + y) * 2 + 1].userData.isClick = false;
          }
          const dist = Math.hypot(x - cx, y - cy);
          setTimeout(() => {
            window.children[((x * r) + y) * 2].visible = visible;
            window.children[((x * r) + y) * 2 + 1].visible = visible;
          }, time * dist);
        }
      }
      break;
    case 7:
      for (let x = 0; x < c; x++) {
        for (let y = 0; y < r; y++) {
          if(visible == false){
            window.children[((x * r) + y) * 2].userData.isBlock = false;
            window.children[((x * r) + y) * 2 + 1].userData.isBlock = false;
            window.children[((x * r) + y) * 2].userData.isDrag = false;
            window.children[((x * r) + y) * 2 + 1].userData.isDrag = false;
            window.children[((x * r) + y) * 2].userData.isClick = false;
            window.children[((x * r) + y) * 2 + 1].userData.isClick = false;
          }
          const dist = Math.hypot(x - cx, y - cy);
          const angle = Math.atan2(y - cy, x - cx);
          setTimeout(() => {
            window.children[((x * r) + y) * 2].visible = visible;
            window.children[((x * r) + y) * 2 + 1].visible = visible;
          }, time * (dist + Math.sin(angle * 5)));
        }
      }
      break;
    case 8:
      for (let x = 0; x < c; x++) {
        for (let y = 0; y < r; y++) {
          if(visible == false){
            window.children[((x * r) + y) * 2].userData.isBlock = false;
            window.children[((x * r) + y) * 2 + 1].userData.isBlock = false;
            window.children[((x * r) + y) * 2].userData.isDrag = false;
            window.children[((x * r) + y) * 2 + 1].userData.isDrag = false;
            window.children[((x * r) + y) * 2].userData.isClick = false;
            window.children[((x * r) + y) * 2 + 1].userData.isClick = false;
          }
          const nx = (x - cx) / (c / 2);
          const ny = (y - cy) / (r / 2);

          // Heart shape function: (x² + y² - 1)³ - x²y³ = 0
          const heartVal = Math.abs(Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * ny * ny * ny);

          // Scale heart distance into a timing offset
          const delay = time * heartVal * 100;

          setTimeout(() => {
            window.children[((x * r) + y) * 2].visible = visible;
            window.children[((x * r) + y) * 2 + 1].visible = visible;
          }, delay);
        }
      }
      break;
    case 9:
      for (let x = 0; x < c; x++) {
        for (let y = 0; y < r; y++) {
          if(visible == false){
            window.children[((x * r) + y) * 2].userData.isBlock = false;
            window.children[((x * r) + y) * 2 + 1].userData.isBlock = false;
            window.children[((x * r) + y) * 2].userData.isDrag = false;
            window.children[((x * r) + y) * 2 + 1].userData.isDrag = false;
            window.children[((x * r) + y) * 2].userData.isClick = false;
            window.children[((x * r) + y) * 2 + 1].userData.isClick = false;
          }
          // random delay for each cell
          const delay = Math.random() * (r * c * time) / 2
          ;

          setTimeout(() => {
            window.children[((x * r) + y) * 2].visible = visible;
            window.children[((x * r) + y) * 2 + 1].visible = visible;
          }, delay);
        }
      }
      break;
    case 10:
      for (let x = 0; x < c; x++) {
        for (let y = 0; y < r; y++) {
          if(visible == false){
            window.children[((x * r) + y) * 2].userData.isBlock = false;
            window.children[((x * r) + y) * 2 + 1].userData.isBlock = false;
            window.children[((x * r) + y) * 2].userData.isDrag = false;
            window.children[((x * r) + y) * 2 + 1].userData.isDrag = false;
            window.children[((x * r) + y) * 2].userData.isClick = false;
            window.children[((x * r) + y) * 2 + 1].userData.isClick = false;
          }
          const delay = time * (x + y) + ((x + y) % 2) * 200;
          setTimeout(() => {
            window.children[((x * r) + y) * 2].visible = visible;
            window.children[((x * r) + y) * 2 + 1].visible = visible;
          }, delay);
        }
      }
      break;
    case 11:
      for (let x = 0; x < c; x++) {
        for (let y = 0; y < r; y++) {
          if(visible == false){
            window.children[((x * r) + y) * 2].userData.isBlock = false;
            window.children[((x * r) + y) * 2 + 1].userData.isBlock = false;
            window.children[((x * r) + y) * 2].userData.isDrag = false;
            window.children[((x * r) + y) * 2 + 1].userData.isDrag = false;
            window.children[((x * r) + y) * 2].userData.isClick = false;
            window.children[((x * r) + y) * 2 + 1].userData.isClick = false;
          }
          const angle = Math.atan2(y - cy, x - cx);
          const dist  = Math.hypot(x - cx, y - cy);
          const delay = time * (dist * 2 + angle * 10);
          setTimeout(() => {
            window.children[((x * r) + y) * 2].visible = visible;
            window.children[((x * r) + y) * 2 + 1].visible = visible;
          }, delay);
        }
      }
      break;
    case 12:
      for (let x = 0; x < c; x++) {
        for (let y = 0; y < r; y++) {
          if(visible == false){
            window.children[((x * r) + y) * 2].userData.isBlock = false;
            window.children[((x * r) + y) * 2 + 1].userData.isBlock = false;
            window.children[((x * r) + y) * 2].userData.isDrag = false;
            window.children[((x * r) + y) * 2 + 1].userData.isDrag = false;
            window.children[((x * r) + y) * 2].userData.isClick = false;
            window.children[((x * r) + y) * 2 + 1].userData.isClick = false;
          }
          const delay = time * Math.random() / 2;
          setTimeout(() => {
            window.children[((x * r) + y) * 2].visible = visible;
            window.children[((x * r) + y) * 2 + 1].visible = visible;
          }, delay);
        }
      }
      break;

  }

}

export function closeWindow(scene, window){
  const time = 10;
  animateTransition(window,false,time)
  setTimeout(() => {
    scene.remove(window);
  },
  window.children.length*time);
  
  return
}

//spellbook window
//art pallete window
//whisper windows
export function buildWindow(
  cols: number,
  rows: number,
  offsetX = 0,
  offsetY = 0,
  zIndex = 0.5, // above main grid
): { backgrounds: THREE.Mesh[][], glyphs: THREE.Mesh[][], group: THREE.Group } {
  const glyphGeometry = new THREE.PlaneGeometry(2, 2);
  const backgrounds: THREE.Mesh[][] = [];
  const glyphs: THREE.Mesh[][] = [];

  const group = new THREE.Group(); // container for the mini-grid
  windows = windows + 1;
  group.renderOrder = windows;
  group.name = "window"
  group.userData.cols = cols;
  group.userData.rows = rows;
  scene.add(group);
  const bgColor = "#"+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)
  const texColor = "#"+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)
  const barPhrase = "Drag Me"

  for (let y = 0; y < rows; y++) {
    const bgRow: THREE.Mesh[] = [];
    const glyphRow: THREE.Mesh[] = [];

    for (let x = 0; x < cols; x++) {
      // Background mesh
      const bgGeometry = new THREE.PlaneGeometry(1, 1);
      const bgMaterial = new THREE.MeshBasicMaterial({ color: bgColor,
        depthWrite: true });
      const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
      bgMesh.position.set(x + offsetX, -(y + offsetY + 0.25), zIndex);
      bgMesh.visible = false;
      group.add(bgMesh);

      // Glyph mesh
      let glyph = "@"
      bgMesh.userData.isBlock = true;
      if(y == 0){
        glyph = "#"
        if(cols > barPhrase.length + 1){
          glyph = barPhrase[x]
        }
        bgMesh.userData.isDrag = true;
        if(x == cols-1){
          glyph = "X"
          bgMesh.userData.isClick = true;
          bgMesh.userData.onClick = "close";
        }
      }
      if(y == rows - 1 || x == 0 || x == cols - 1) {
        bgMesh.userData.isDrag = true;
      }
      if(npcs){
        if(y > 0 && x > (cols - AVATAR_WIDTH) && y < (rows - AVATAR_HEIGHT)){
          console.log(npcs)
          const iconbits = npcs[0].icon.split("")
          glyph = iconbits[x+(y*rows)]
        }
      }
      if(y == (rows - AVATAR_HEIGHT)){
        glyph = " "
        bgMesh.userData.isClick = true;
        bgMesh.userData.onClick = "input";
      }

      bgRow.push(bgMesh);
      const tex = getCharTexture(glyph, texColor);
      const material = new THREE.MeshBasicMaterial({ map: tex,
        transparent: true,
        depthWrite: false });
      const glyphMesh = new THREE.Mesh(glyphGeometry, material);
      glyphMesh.visible = false;
      glyphMesh.position.set(x + offsetX, -(y + offsetY), zIndex);
      glyphMesh.userData = { x,
        y,
        char: " " };
      group.add(glyphMesh);
      glyphRow.push(glyphMesh);
    }

    backgrounds.push(bgRow);
    glyphs.push(glyphRow,pointer);
  }
  const time = 10;
  

  const handlePointerMove = (event: PointerEvent) => {
    console.log("no dragging")
    if (!dragging) return;
    console.log("dragging")

    const width = camera.right-camera.left;
    const height = camera.top-camera.bottom;
    
    const mouseWorldX = (event.clientX / window.innerWidth) * width;
    const mouseWorldY = (event.clientY / window.innerHeight) * height;

    const worldX = dragOffset.x+mouseWorldX;
    const worldY = dragOffset.y+mouseWorldY;
    //average position to fit grid
    const cellX = Math.round(worldX/1)*1;
    const cellY = Math.round(worldY/1)*1;
    console.log(cellX,cellY)

    // Move the object
    dragging.position.set(cellX, -cellY, dragging.position.z);
  };  

  window.addEventListener("pointermove", handlePointerMove);
  animateTransition(group,true,time)

  return { backgrounds,
    glyphs,
    group };
}
