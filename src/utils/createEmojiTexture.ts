import Phaser from 'phaser';
import { CONFIG } from '../config';

const ICON_DPI_SCALE = 2;

export interface ItemIconInfo {
  typeId: string;
  emoji: string;
  textureKey: string;
}

/** Danh sách tất cả icon theo loại (dùng cho spawn + texture) */
export function getAllItemIcons(): ItemIconInfo[] {
  const list: ItemIconInfo[] = [];
  let idx = 0;
  for (const t of CONFIG.itemTypes) {
    for (const emoji of t.icons) {
      list.push({ typeId: t.id, emoji, textureKey: `item_${idx}` });
      idx++;
    }
  }
  return list;
}

export function createEmojiTexture(
  scene: Phaser.Scene,
  key: string,
  emoji: string,
  size: number = CONFIG.iconSize
): void {
  const texSize = size * ICON_DPI_SCALE;
  const canvasTexture = scene.textures.createCanvas(key, texSize, texSize);
  if (!canvasTexture) return;

  const canvas = canvasTexture.getSourceImage() as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const c = Math.floor(texSize / 2);
  ctx.clearRect(0, 0, texSize, texSize);

  const fontSize = Math.floor(texSize * 0.6);
  ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, c, c);

  canvasTexture.refresh();
}

export function createAllItemTextures(scene: Phaser.Scene): void {
  const all = getAllItemIcons();
  for (const { emoji, textureKey } of all) {
    createEmojiTexture(scene, textureKey, emoji, CONFIG.iconSize);
  }
}

const GOOD_ITEM_IDS = ['basic', 'high', 'bonus', 'luck'];
const BAD_ITEM_IDS = ['heavyPenalty', 'quickPenalty', 'loseLife', 'obstacle'];

/** Chọn loại vật phẩm theo trọng số (level >= hardModeFromLevel dùng bảng khó) */
export function pickItemTypeByWeight(level: number = 1): string {
  const hardFrom = (CONFIG as { scenarios?: { hardModeFromLevel?: number } }).scenarios?.hardModeFromLevel ?? 99;
  const w = (level >= hardFrom
    ? (CONFIG as { itemTypeWeightsHard?: Record<string, number> }).itemTypeWeightsHard
    : CONFIG.itemTypeWeights) as Record<string, number>;
  if (!w) return CONFIG.itemTypes[0].id;
  const total = Object.values(w).reduce((a, b) => a + b, 0);
  let r = Math.floor(Math.random() * total);
  for (const [typeId, weight] of Object.entries(w)) {
    r -= weight;
    if (r < 0) return typeId;
  }
  return CONFIG.itemTypes[0].id;
}

/** Chọn chỉ vật xấu (dùng trong Bão / Hỗn loạn) */
export function pickItemTypeStorm(): string {
  const w = CONFIG.itemTypeWeights as Record<string, number>;
  let total = 0;
  for (const id of BAD_ITEM_IDS) {
    total += w[id] ?? 0;
  }
  if (total <= 0) return 'heavyPenalty';
  let r = Math.floor(Math.random() * total);
  for (const typeId of BAD_ITEM_IDS) {
    const weight = w[typeId] ?? 0;
    r -= weight;
    if (r < 0) return typeId;
  }
  return 'heavyPenalty';
}

/** Chọn chỉ vật tốt (dùng trong Hiệp Vàng) */
export function pickItemTypeGoldenRound(): string {
  const w = CONFIG.itemTypeWeights as Record<string, number>;
  let total = 0;
  for (const id of GOOD_ITEM_IDS) {
    total += w[id] ?? 0;
  }
  if (total <= 0) return 'basic';
  let r = Math.floor(Math.random() * total);
  for (const typeId of GOOD_ITEM_IDS) {
    const weight = w[typeId] ?? 0;
    r -= weight;
    if (r < 0) return typeId;
  }
  return 'basic';
}

const PEACE_ITEM_IDS = ['basic', 'high', 'bonus', 'luck', 'extraLife', 'shield'];
const HEART_RAIN_IDS = ['extraLife', 'shield'];

/** Chọn vật tốt + ❤️🛡️ (dùng trong Bình yên) */
export function pickItemTypePeace(): string {
  const w = CONFIG.itemTypeWeights as Record<string, number>;
  let total = 0;
  for (const id of PEACE_ITEM_IDS) {
    total += w[id] ?? 0;
  }
  if (total <= 0) return 'basic';
  let r = Math.floor(Math.random() * total);
  for (const typeId of PEACE_ITEM_IDS) {
    const weight = w[typeId] ?? 0;
    r -= weight;
    if (r < 0) return typeId;
  }
  return 'basic';
}

/** Điểm khi hứng vật tốt: 1–5 điểm, xác suất 5 điểm = 1% */
export function getGoodItemScore(): number {
  const cfg = (CONFIG as { goodItemScore?: { chanceFive?: number; chanceFour?: number; chanceThree?: number; chanceTwo?: number } }).goodItemScore;
  if (!cfg) return Phaser.Math.Between(1, 5);
  const r = Math.random();
  if (r < (cfg.chanceFive ?? 0.01)) return 5;
  if (r < (cfg.chanceFive ?? 0.01) + (cfg.chanceFour ?? 0.09)) return 4;
  if (r < (cfg.chanceFive ?? 0.01) + (cfg.chanceFour ?? 0.09) + (cfg.chanceThree ?? 0.2)) return 3;
  if (r < (cfg.chanceFive ?? 0.01) + (cfg.chanceFour ?? 0.09) + (cfg.chanceThree ?? 0.2) + (cfg.chanceTwo ?? 0.3)) return 2;
  return 1;
}

/** Chọn chỉ ❤️ hoặc 🛡️ (dùng trong Trái tim rơi) */
export function pickItemTypeHeartRain(): string {
  const w = CONFIG.itemTypeWeights as Record<string, number>;
  let total = 0;
  for (const id of HEART_RAIN_IDS) {
    total += w[id] ?? 0;
  }
  if (total <= 0) return 'extraLife';
  let r = Math.floor(Math.random() * total);
  for (const typeId of HEART_RAIN_IDS) {
    const weight = w[typeId] ?? 0;
    r -= weight;
    if (r < 0) return typeId;
  }
  return 'extraLife';
}
