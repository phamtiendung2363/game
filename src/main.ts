import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import { CONFIG } from './config';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  parent: 'game-container',
  width: CONFIG.width,
  height: CONFIG.height,
  backgroundColor: CONFIG.colors.skyTop,
  scale: {
    mode: Phaser.Scale.RESIZE,  // Tự động resize theo màn hình
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: CONFIG.width,
    height: CONFIG.height,
    parent: 'game-container'
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  render: {
    antialias: false,
    roundPixels: true,
    pixelArt: false,
    powerPreference: 'high-performance'
  },
  scene: [GameScene]
};

new Phaser.Game(config);
