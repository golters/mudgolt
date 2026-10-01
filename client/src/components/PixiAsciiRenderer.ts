import { Application, BitmapFont, BitmapFontManager, Container, Rectangle, Sprite, TextStyle, Texture } from 'pixi.js';
import { HOME_GLYPHS } from './home_art';

export interface PixiAsciiTile {
  character: string;
  avgColor: number;
  backColor: number;
}

interface PixiCell {
  background: Sprite;
  character: Sprite;
  tile: PixiAsciiTile;
}

interface PixiGlyph {
  texture: Texture;
  xAdvance: number;
  xOffset: number;
  yOffset: number;
}

const EMPTY_TILE: PixiAsciiTile = {
  character: '',
  avgColor: 0,
  backColor: 0,
};

export class PixiAsciiRenderer {
  private readonly app = new Application();
  private readonly stage = new Container();
  private readonly backgrounds = new Container();
  private readonly characters = new Container();
  private readonly glyphs = new Map<string, PixiGlyph>();
  private glyphFontName = '';
  private cells: PixiCell[][] = [];
  private doorTiles: boolean[][] = [];
  private width = 0;
  private height = 0;
  private cellWidth = 0;
  private cellHeight = 0;
  private fontSize = 0;

  static async create(root: HTMLElement): Promise<PixiAsciiRenderer> {
    const renderer = new PixiAsciiRenderer();
    await renderer.app.init({
      resizeTo: root,
      antialias: false,
      autoDensity: true,
      backgroundAlpha: 0,
      resolution: window.devicePixelRatio || 1,
    });
    await document.fonts.load('16px DOS8');
    renderer.app.ticker.stop();
    renderer.stage.addChild(renderer.backgrounds, renderer.characters);
    renderer.app.canvas.className = 'ascii-pixi-canvas';
    root.replaceChildren(renderer.app.canvas);
    return renderer;
  }

  render(tiles: PixiAsciiTile[][], doorTiles: boolean[][]): void {
    const width = tiles[0]?.length || 0;
    const height = tiles.length;
    if (width === 0 || height === 0) {
      return;
    }

    this.app.renderer.resize(window.innerWidth, window.innerHeight);
    const cellWidth = this.app.renderer.width / this.app.renderer.resolution / width;
    const cellHeight = this.app.renderer.height / this.app.renderer.resolution / height / 1.05;
    const needsRebuild = this.width !== width ||
      this.height !== height ||
      this.cellWidth !== cellWidth ||
      this.cellHeight !== cellHeight;

    if (needsRebuild) {
      this.rebuild(width, height, cellWidth, cellHeight);
    }

    this.doorTiles = doorTiles;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = this.cells[y][x];
        const tile = tiles[y][x];
        if (cell.tile.character === tile.character &&
          cell.tile.avgColor === tile.avgColor &&
          cell.tile.backColor === tile.backColor) {
          continue;
        }

        cell.background.tint = tile.backColor;
        const glyph = this.glyphs.get(tile.character);
        if (glyph) {
          const scale = this.cellWidth / glyph.xAdvance;
          cell.character.texture = glyph.texture;
          cell.character.scale.set(scale);
          cell.character.position.set(
            x * this.cellWidth + glyph.xOffset * scale,
            y * this.cellHeight + glyph.yOffset * scale
          );
        } else {
          cell.character.texture = Texture.EMPTY;
        }
        cell.character.tint = tile.avgColor;
        cell.tile.character = tile.character;
        cell.tile.avgColor = tile.avgColor;
        cell.tile.backColor = tile.backColor;
      }
    }

    this.app.renderer.render({ container: this.stage });
  }

  isDoorAt(clientX: number, clientY: number): boolean {
    const bounds = this.app.canvas.getBoundingClientRect();
    const x = Math.floor((clientX - bounds.left) * this.width / bounds.width);
    const y = Math.floor((clientY - bounds.top) * this.height / bounds.height);
    return Boolean(this.doorTiles[y]?.[x]);
  }

  destroy(): void {
    this.destroyGlyphTextures();
    this.app.destroy({ removeView: true }, { children: true, texture: true });
  }

  private rebuild(width: number, height: number, cellWidth: number, cellHeight: number): void {
    this.backgrounds.removeChildren().forEach(child => child.destroy());
    this.characters.removeChildren().forEach(child => child.destroy());
    this.cells = [];
    this.destroyGlyphTextures();
    this.width = width;
    this.height = height;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.fontSize = cellWidth * 2;
    this.createGlyphAtlas();
    this.stage.y = (this.app.renderer.height / this.app.renderer.resolution - cellHeight * height) / 2;

    for (let y = 0; y < height; y++) {
      const row: PixiCell[] = [];
      for (let x = 0; x < width; x++) {
        const background = new Sprite(Texture.WHITE);
        background.position.set(x * cellWidth, y * cellHeight);
        background.width = cellWidth + 1;
        background.height = cellHeight + 1;
        const character = new Sprite(Texture.EMPTY);
        character.position.set(x * cellWidth, y * cellHeight);
        this.backgrounds.addChild(background);
        this.characters.addChild(character);
        row.push({ background, character, tile: { ...EMPTY_TILE } });
      }
      this.cells.push(row);
    }
  }

  private createGlyphAtlas(): void {
    const pixelRatio = window.devicePixelRatio || 1;
    this.glyphFontName = 'home-ascii-font';
    BitmapFont.install({
      name: this.glyphFontName,
      style: {
        fontFamily: 'DOS8',
        fontSize: this.fontSize,
        fontWeight: 'normal',
        fill: '#ffffff',
      },
      chars: HOME_GLYPHS,
      dynamicFill: true,
      padding: 2,
      resolution: pixelRatio,
      textureStyle: { scaleMode: 'nearest' },
    });

    const bitmapFont = BitmapFontManager.getFont(
      HOME_GLYPHS,
      new TextStyle({ fontFamily: this.glyphFontName, fontSize: this.fontSize })
    );
    for (const character of HOME_GLYPHS) {
      const glyph = bitmapFont.chars[character];
      if (glyph?.texture) {
        const padding = -glyph.xOffset;
        const frame = glyph.texture.frame;
        const texture = new Texture({
          source: glyph.texture.source,
          frame: new Rectangle(
            frame.x + padding,
            frame.y + padding,
            frame.width - padding * 2,
            frame.height - padding * 2
          ),
        });
        this.glyphs.set(character, {
          texture,
          xAdvance: glyph.xAdvance,
          xOffset: 0,
          yOffset: 0,
        });
      }
    }
  }

  private destroyGlyphTextures(): void {
    this.glyphs.forEach(({ texture }) => texture.destroy(false));
    this.glyphs.clear();
    if (this.glyphFontName) {
      BitmapFont.uninstall(this.glyphFontName);
      this.glyphFontName = '';
    }
  }

}