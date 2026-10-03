// /core/canvasManager.ts
import * as THREE from "three";
import { changeTyping, getCharTexture } from "./Header";
import { sendEvent } from "../network";
import { DRAW_EVENT } from "../../../events";
import { globalGrid, globalBackGrid,typing } from "./Header";
import { BANNER_WIDTH } from "../../../constants";
import { closeWindow } from "./windowManager";

export let brush = localStorage.brush || "+"

export let dragging;
export let dragOffset;
export let dragEvent;
export const pointer = new THREE.Vector2();

export const setBrush = (newBrush: string) => {
  localStorage.brush = newBrush
  brush = newBrush
}


export function addPointerInteraction(
  scene: THREE.Scene,
  camera: THREE.Camera,
  bgGrid: THREE.Mesh[][],
  glyphGrid: THREE.Mesh[][],
  interactiveRows: number,
) {
  const raycaster = new THREE.Raycaster();
  const handlePointerMove = (event: PointerEvent) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(scene.children)
      .find(obj => obj.object.userData.isBackground);
    if (hit)hoverGrid(hit);
  };

  const hoverGrid = (hit) =>{
    //if cusror rests over a cell for long enough before moving it doesn't reset+
    if (hit.object.userData.y >= interactiveRows) return;
    const { x } = hit.object.userData;
    let { y } = hit.object.userData;
    y = y - 0.25;
    const glyph = glyphGrid[y][x];
    const bg = bgGrid[y][x];

    // cancel any pending restore
    clearTimeout(glyph._hoverTimeout);

    // apply hover
    const tex = getCharTexture(brush, "#ff0");
    if (tex.userData.scaleFactor < 0.5) {
      glyph.scale.set(1 / tex.userData.scaleFactor, 1 / tex.userData.scaleFactor);
    }
    glyph.material.map = tex;
    glyph.material.needsUpdate = true;

    // restore only if pointer leaves
    glyph._hoverTimeout = setTimeout(() => {
      const hit2 = raycaster.intersectObjects(scene.children)
        .find(obj => obj.object.userData.isBackground);
      if (hit2?.object.userData.x === x && hit2?.object.userData.y === y) return;

      const restoreGlyph = globalGrid[y * BANNER_WIDTH + x];
      const restoreTex = getCharTexture(restoreGlyph, "#fff");
      if (restoreTex.userData.scaleFactor < 0.5) {
        glyph.scale.set(1 / restoreTex.userData.scaleFactor, 1 / restoreTex.userData.scaleFactor);
      }
      glyph.material.map = restoreTex;
      glyph.material.needsUpdate = true;
    }, 100);

  }

  function bringToFront(object) {
    const frontZ = camera.position.z - 0.1;

    // Push back every other object by reducing their current z by 1
    scene.traverse(o => {
      if (o !== object && o.position && typeof o.position.z === "number") {
        o.position.z -= 1;
      }
    });

    // Bring the selected object to the front (but still behind the camera)
    object.traverse(o => {
      if ((o.isMesh || o.isGroup || o.isObject3D) && o.position) {
        o.position.z = frontZ;
      }
    });
  }


  const handlePointerDown = (event: PointerEvent) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const topObject = raycaster
      .intersectObjects(scene.children, true)
      .filter(i => i.object.userData.isBackground || i.object.userData.isDrag || i.object.userData.isBlock || i.object.userData.isBlock)
      .sort((a, b) => {
        const pa = a.object.getWorldPosition(new THREE.Vector3()).project(camera).z;
        const pb = b.object.getWorldPosition(new THREE.Vector3()).project(camera).z;
        if (pa !== pb) return pa - pb;

        // Secondary sort: by renderOrder (if set), then by object ID or index to stabilize
        const ra = a.object.parent.renderOrder || 0;
        const rb = b.object.parent.renderOrder || 0;
        console.log(ra,rb)

        if (ra !== rb) return rb - ra;

        return a.object.id - b.object.id; // fallback deterministic sort
      })[0]?.object;
    console.log("z index",topObject.position.z,"render order",topObject.parent)
    if(!topObject)return;

    if (topObject) {
      switch (true) {
        case !!topObject.userData.isClick:
          if (topObject.userData.onClick){
            switch(topObject.userData.onClick) {
              case "close":
                closeWindow(scene, topObject.parent);
                break;
              case "input":
                changeTyping(topObject)
                break;
            }
          }
          break;
        case !!topObject.userData.isDrag:
          bringToFront(topObject.parent)
          const width = camera.right-camera.left;
          const height = camera.top-camera.bottom;
          const mouseWorldX = (event.clientX / window.innerWidth) * width;
          const mouseWorldY = (event.clientY / window.innerHeight) * height;
          dragging = topObject.parent;
          dragOffset = { x: topObject.parent.position.x - mouseWorldX,
            y: -topObject.parent.position.y - mouseWorldY };
          dragEvent = event;
          console.log("drag",dragging)
          break;

        case !!topObject.userData.isBackground:
          const mesh = topObject as THREE.Mesh;
          const { x, y } = mesh.userData;

          if (y >= interactiveRows) return;

          sendEvent(DRAW_EVENT, [x, y, brush]);
          break;

        default:
          //nothing
          break;
      }
    }
  };
  const handlePointerUp = () => {
    dragging = null;
    console.log("not dragging")
  };

  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerdown", handlePointerDown);

  return () => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerdown", handlePointerDown);
  };
}
