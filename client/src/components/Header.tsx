'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { addPointerInteraction } from './canvasManager';
import { createChatManager} from './Terminal';
import { networkEmitter } from "../network/events";
import { ROOM_UPDATE_EVENT, TOOLBAR_UPDATE_EVENT,WINDOW_EVENT} from "../../../events";
import { Room } from "../../../@types";
import { BANNER_HEIGHT,BANNER_WIDTH } from '../../../constants';
import { Glyph } from '../../../@types';
import { buildWindow } from './windowManager';
import { sendEvent } from "../network"

await document.fonts.load('64px DOS8');
//not preloading font 100% of the time!

export const scene = new THREE.Scene();
export let camera = new THREE.OrthographicCamera();
camera.position.z = 1;

export const renderer = new THREE.WebGLRenderer({ antialias: false });
document.body.appendChild(renderer.domElement);

const textureCache: Record<string, THREE.Texture> = {};

const regex = /\p{RI}\p{RI}|\p{Emoji}(\p{EMod}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?(\u{200D}\p{Emoji}(\p{EMod}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?)*|./gus;

export const stringToGlyphs = (text: string): Glyph[] => {
  const chars = text.match(regex) || [];
  
  return chars.map(char => ({ char }));
};

export let globalGrid;
export let globalBackGrid;

export let typing = null;
export function changeTyping(input:object){
  console.log("input",input)
  typing = input;
}


export function getCharTexture(char: Glyph | string, fg = "#ffffff") {
  const s = typeof char === "string" ? stringToGlyphs(char)[0]?.char ?? "" : (char && "char" in char ? char.char : "");
  let key = `${s}-${fg}`;
  if (textureCache[key]) return textureCache[key];
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  let fontSize = 64
  const ctx = canvas.getContext("2d");
  ctx.font = fontSize+`px ${(s.codePointAt(0) ?? 0) >= 0x1F300 && (s.codePointAt(0) ?? 0) <= 0x1F5FF ? '"Noto Color Emoji"' : 'DOS8'}`;


  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const metrics = ctx.measureText(s);
  const scaleFactor = canvas.width / metrics.width
  let cx = (canvas.width / 2);
  let cy = (canvas.height / 2);

  if(scaleFactor < 0.5){
    canvas.width = 64 * (1/scaleFactor);
    canvas.height = 64 * (1/scaleFactor);
    ctx.scale(1/scaleFactor,1/scaleFactor);
    //cx = 0;
    cx = (canvas.width / 2) - (metrics.width / 2);
    //cx = (canvas.width / 2 * scaleFactor / 1.25);
    cy = canvas.height / 2 * scaleFactor * 1.15;
  }

  // Clear the canvas to full transparency
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw main glyph
  const color = typeof char === "object" && char?.color ? char.color : fg;
  ctx.fillStyle = (typeof color === "string" && CSS.supports("color", color)) ? color : "#fff";

  ctx.fillText(s, cx, cy);


  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  (tex as any).userData = { scaleFactor };

  textureCache[key] = tex;
  return tex;
}

export function createCellBackgroundMesh(x: number, y: number, color = '#111'): THREE.Mesh {
  //back cells not alligned with glyphs, also add border
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.MeshBasicMaterial({
    color,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, -y, -0.01);

  // Add these lines:
  mesh.userData = {
    x,
    y,
    isBackground: true, // for filtering in raycasting
  };

  return mesh;
}

export function buildGrid(scene: THREE.Scene, cols: number, rows: number): { backgrounds: THREE.Mesh[][], glyphs: THREE.Mesh[][] } {
  const glyphGeometry = new THREE.PlaneGeometry(2, 2); // make glyphs large
  glyphGeometry.translate(0, 0, 0); // center over 1x1 cell
  const backgrounds: THREE.Mesh[][] = [];
  const glyphs: THREE.Mesh[][] = [];
  const gridGroup = new THREE.Group();
  scene.add(gridGroup);

  for (let y = 0; y < rows; y++) {
    const bgRow: THREE.Mesh[] = [];
    const glyphRow: THREE.Mesh[] = [];

    for (let x = 0; x < cols; x++) {
      // Background mesh (below glyph)
      let bgMesh = createCellBackgroundMesh(x, y+ 0.25, "#222");
      if (y < BANNER_HEIGHT){
      bgMesh = createCellBackgroundMesh(x, y+ 0.25, "#555");
      }
      gridGroup.add(bgMesh);
      gridGroup.name = "gridGroup"
      bgRow.push(bgMesh);

      // Glyph mesh (transparent background)
      const tex = getCharTexture(" ", "#ffffff");
      const material = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
      });
      const glyphMesh = new THREE.Mesh(glyphGeometry, material);
      glyphMesh.position.set(x, -y, 0);
      glyphMesh.userData = { x, y, char: " " };
      gridGroup.add(glyphMesh);
      glyphRow.push(glyphMesh);
    }

    backgrounds.push(bgRow);
    glyphs.push(glyphRow);
  }

  return { backgrounds, glyphs };
}


export function updateTextRow(
  rowMeshes: THREE.Mesh[],
  text: Glyph[],
  fg = "#fff",
  bg = "#111",
) {
  //const padded = text.padEnd(rowMeshes.length).slice(0, rowMeshes.length);
  for (let j = 0; j < rowMeshes.length; j++) {
    const ch = text[j];
    const color = ch?.color ?? fg;
    const tex = getCharTexture(ch, color);
    //if character is long add spaces before next character?
    rowMeshes[j].material.map = tex;
    rowMeshes[j].material.needsUpdate = true;
  }
}


export const Header: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rowsRef = useRef(20);
  const gridMeshRef = useRef<THREE.Mesh[][] | null>(null);

  useEffect(() => {
    const cols = BANNER_WIDTH;
    let rows = 32;
    const interactiveRows = BANNER_HEIGHT;
    rowsRef.current = 32;

    // Set up scene
    
    camera = new THREE.OrthographicCamera();
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current?.appendChild(renderer.domElement);

    const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);

    // Set up grid
    // Build both background and glyph grids
    const grids = buildGrid(scene, cols, rows);
    //const popup = buildWindow(scene, 10, 10);
    let bgGrid = grids.backgrounds;
    let gridMesh = grids.glyphs;
    gridMeshRef.current = gridMesh;

    function applyRoomToGrid(room: Room, glyphGrid: THREE.Mesh[][], bgGrid: THREE.Mesh[][]) {
      const bannerArray = stringToGlyphs(room.banner || "").map(g => g.char);
      const primeColors = room.primeColor?.split(",") ?? [];
      const backColors = room.backColor?.split(",") ?? [];
      globalGrid = bannerArray;
      globalBackGrid = room.backColor;

      for (let y = 0; y < interactiveRows; y++) {
        const glyphRow = glyphGrid[y];
        const bgRow = bgGrid[y];

        const start = y * glyphRow.length;
        const end = start + glyphRow.length;

        const line = bannerArray.slice(start, end);
        const fgColors = primeColors.slice(start, end).map(c => c || "#ccc");
        const bgColors = backColors.slice(start, end).map(c => c || "#111");

        // Update backgrounds color per cell
        for (let x = 0; x < bgRow.length; x++) {
          //color undefined
          //bgRow[x].material.color.set(bgColors[x]);
          bgRow[x].material.needsUpdate = true;
        }

        // Update glyphs per cell
        for (let x = 0; x < glyphRow.length; x++) {
          const tex = getCharTexture(line[x] || " ", fgColors[x]);
          if(tex.userData.scaleFactor < 0.5){
        glyphRow[x].scale.set(1/tex.userData.scaleFactor, 1/tex.userData.scaleFactor)
      }
          glyphRow[x].material.map = tex;
          glyphRow[x].material.needsUpdate = true;
        }
      }
    }

    


    networkEmitter.on(ROOM_UPDATE_EVENT, (room: Room) => {
      //console.log(`[ROOM_UPDATE_EVENT] id: ${room.id}, name: ${room.name}, banner length: ${room.banner.length}`);

      applyRoomToGrid(room, gridMesh, bgGrid);
      sendEvent(TOOLBAR_UPDATE_EVENT, room.id)
    });

    networkEmitter.on(WINDOW_EVENT, () => {
      console.log("recieved window event")
      buildWindow(scene,10,10)
    });




    const chat = createChatManager(gridMesh);
    function addRows(grid: THREE.Mesh[][], scene: THREE.Scene, cols: number, newRows: number) {
      const glyphGeometry = new THREE.PlaneGeometry(2, 2); // same as buildGrid
      glyphGeometry.translate(0, 0, 0); // match centering
      const chatGroup = new THREE.Group();
      chatGroup.name = "chatGroup"
      scene.add(chatGroup);

      for (let y = grid.length; y < newRows; y++) {
        const row: THREE.Mesh[] = [];
        for (let x = 0; x < cols; x++) {
          const tex = getCharTexture(" ", "#ffffff");
          const material = new THREE.MeshBasicMaterial({
            map: tex,
            transparent: true,
            depthWrite: false,
          });
          const glyphMesh = new THREE.Mesh(glyphGeometry, material);
          glyphMesh.position.set(x, -y, 0);
          glyphMesh.userData = { x, y, char: " " };
          chatGroup.add(glyphMesh);
          row.push(glyphMesh);
        }
        grid.push(row);
      }
    }


    // Resize logic
    function resizeRenderer() {
      const screenAspect = window.innerWidth / window.innerHeight;
      const gridAspect = cols / rows;
      let viewW: number, viewH: number;

      if (screenAspect > gridAspect) {
        viewH = rows;
        viewW = viewH * screenAspect;
      } else {
        viewW = cols;
        viewH = viewW / screenAspect;
      }

      const requiredRows = Math.ceil((window.innerHeight / window.innerWidth) * cols);

      if (requiredRows > rows) {
        // Add rows at bottom
        addRows(gridMesh, scene, cols, requiredRows);
        rows = requiredRows;
      } else if (requiredRows < rows) {
        // Remove rows from top
        for (let y = rows - 1; y >= requiredRows; y--) {
          const row = gridMesh.pop();
          if (row) {
            for (const mesh of row) {
              scene.remove(mesh);
              if (mesh.material.map) mesh.material.map.dispose();
              mesh.material.dispose();
              mesh.geometry.dispose();
            }
          }
        }
        rows = requiredRows;
      }

      const halfW = viewW / 2;
      const halfH = viewH / 2;

      camera.left = -halfW + cols / 2;
      camera.right = halfW + cols / 2;
      camera.top = halfH - rows / 2;
      camera.bottom = -halfH - rows / 2;
      camera.updateProjectionMatrix();

      console.log("width:",camera.right-camera.left,"height:",camera.top-camera.bottom);

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderTarget.setSize(window.innerWidth, window.innerHeight);
      chat.updateChatDisplay();
      chat.updateInputRow(typing);
    }

const input = document.querySelector("input");
    resizeRenderer();
    window.addEventListener('resize', resizeRenderer);

    // Handle key input
    window.addEventListener('keydown', chat.handleKey);

    addPointerInteraction(scene, camera, bgGrid, gridMesh, interactiveRows);


    // Overlay shader setup
    const overlayScene = new THREE.Scene();
    const overlayCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const overlayMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform vec2 resolution;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          vec2 center = vec2(0.5, 0.5);
          vec2 delta = uv - center;
          float dist = length(delta);

          // Low strength for subtle effect
          float strength = 0.005;

          // Offset for chromatic aberration per channel
          vec2 redOffset = vec2(strength, 0.0);
          vec2 greenOffset = vec2(0.0, strength);
          vec2 blueOffset = vec2(-strength, 0.0);

          // Sample texture with offsets
          float cappedDist = min(dist, 0.2);
          float r = texture2D(tDiffuse, uv + redOffset * cappedDist).r;
          float g = texture2D(tDiffuse, uv + greenOffset * cappedDist).g;
          float b = texture2D(tDiffuse, uv + blueOffset * cappedDist).b;


          vec3 color = vec3(r, g, b);

          // Optional: Slight vignette or distortion (commented out)
          // uv = center + delta * (1.0 + strength * dist * dist);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    const overlayQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), overlayMaterial);
    overlayScene.add(overlayQuad);

    // Initial drawing
    chat.updateChatDisplay();
    chat.updateInputRow(typing);

    // Animate
    const animate = (time: number) => {
      requestAnimationFrame(animate);

      renderer.setRenderTarget(renderTarget);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);

      overlayMaterial.uniforms.tDiffuse.value = renderTarget.texture;
      overlayMaterial.uniforms.time.value = time * 0.001;
      overlayMaterial.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);

      renderer.render(overlayScene, overlayCamera);
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', resizeRenderer);
      window.removeEventListener('keydown', chat.handleKey);
      renderer.dispose();
      renderTarget.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />;
};
