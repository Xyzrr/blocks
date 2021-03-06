import {Block, createBlock} from './blocks';
import {Biome, BIOME_TYPES, createBiome} from './biomes';
import {
  BIOME_SIZE,
  CAVE_RADIUS,
  HEIGHT_VARIATION,
  MAX_BIOME_GENERATION_DEPTH,
  MIN_Z,
  NUM_CAVES,
} from './consts';
import {randBetween, randFromArray} from './util';

interface Coord2D {
  x: number;
  y: number;
}
interface Coord extends Coord2D {
  z: number;
}

interface World {
  [coordStr: string]: Block;
}

interface Biomes {
  [coord2DStr: string]: Biome;
}

const biomes: Biomes = {};
const world: World = {};

function populateBiomes(depth: number, x: number, y: number): void {
  if (depth > MAX_BIOME_GENERATION_DEPTH) {
    return;
  }
  const coord2DStr = `${x},${y}`;
  if (biomes[coord2DStr] == null) {
    biomes[coord2DStr] = createBiome(
      BIOME_TYPES[Math.floor(Math.random() * BIOME_TYPES.length)]
    );
  }
  populateBiomes(depth + 1, x, y - BIOME_SIZE);
  populateBiomes(depth + 1, x, y + BIOME_SIZE);
  populateBiomes(depth + 1, x - BIOME_SIZE, y);
  populateBiomes(depth + 1, x + BIOME_SIZE, y);
}
populateBiomes(0, 0, 0);

function populateWorld(depth: number, x: number, y: number): void {
  if (depth > MAX_BIOME_GENERATION_DEPTH) {
    return;
  }
  if (world[coordToStr({x, y, z: 0})] == null) {
    fillWorldChunk(x, y);
  }
  populateWorld(depth + 1, x, y - BIOME_SIZE);
  populateWorld(depth + 1, x, y + BIOME_SIZE);
  populateWorld(depth + 1, x - BIOME_SIZE, y);
  populateWorld(depth + 1, x + BIOME_SIZE, y);
}
populateWorld(0, 0, 0);

function fillWorldChunk(startX: number, startY: number): void {
  const biome = getBiome({x: startX, y: startY});
  for (let x = startX; x < startX + BIOME_SIZE; x++) {
    for (let y = startY; y < startY + BIOME_SIZE; y++) {
      const height = getHeight({x, y});
      for (let z = MIN_Z; z <= height; z++) {
        world[coordToStr({x, y, z})] = createBlock(biome.type);
      }
    }
  }
}

function generateCaves(): void {
  const allCoords = Object.keys(world).map(strToCoord);
  for (let i = 0; i < NUM_CAVES; i++) {
    const coord = randFromArray(allCoords);
    const zStart = randBetween(MIN_Z, 0);
    for (let x = coord.x - CAVE_RADIUS; x <= coord.x + CAVE_RADIUS; x++) {
      for (let y = coord.y - CAVE_RADIUS; x <= coord.y + CAVE_RADIUS; y++) {
        for (let z = zStart; z < zStart + CAVE_RADIUS; z++) {
          delete world[coordToStr({x, y, z})];
        }
      }
    }
  }
}
generateCaves();

function getHeight({x, y}: Coord2D): number {
  const d = Math.sqrt(x * x + y * y);
  const mult = Math.sin(d);
  return Math.round(mult * HEIGHT_VARIATION);
}

export function getBlock(c: Coord): Block | null {
  return world[coordToStr(c)] ?? null;
}

export function getBiome(c: Coord2D): Biome {
  return biomes[coord2DToStr(c)];
}

export function coordToStr({x, y, z}: Coord): string {
  return `${x},${y},${z}`;
}
export function strToCoord(str: string): Coord {
  const split = str.split(',').map(Number);
  if (split.length !== 3 || split.some(Number.isNaN)) {
    throw new Error(`invalid Coord string: ${str}`);
  }
  return {x: split[0], y: split[1], z: split[2]};
}

export function coord2DToStr({x, y}: Coord2D): string {
  return `${x},${y}`;
}
export function strToCoord2D(str: string): Coord2D {
  const split = str.split(',').map(Number);
  if (split.length !== 2 || split.some(Number.isNaN)) {
    throw new Error(`invalid Coord2D string: ${str}`);
  }
  return {x: split[0], y: split[1]};
}
