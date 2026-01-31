import Phaser from 'phaser';
import { CONFIG } from '../config';

const HUD_DEPTH = 100;
const BAR_HEIGHT = 46;
const MARGIN_TOP = 14;
const MARGIN_SIDE = 14;
const RADIUS = 16;
const ICON_SIZE = 24;

const FONT = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";
const TEXT_STROKE = '#000000';
const TEXT_STROKE_THICK = 5;
const TEXT_STROKE_THIN = 4;

function round(x: number): number {
  return Math.round(x);
}

export class HUD {
  private scene: Phaser.Scene;
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private barBg!: Phaser.GameObjects.Graphics;
  private barBorder!: Phaser.GameObjects.Graphics;
  private iconGraphics: Phaser.GameObjects.Graphics[] = [];
  private dividers: Phaser.GameObjects.Graphics[] = [];
  private shieldGraphic: Phaser.GameObjects.Graphics | null = null;
  private shieldX = 0;
  private shieldCy = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createHUD();
  }

  private drawStar(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number, color: number): void {
    const n = 5;
    const innerR = r * 0.42;
    g.lineStyle(2, 0xC9A227, 1);
    g.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = (i * Math.PI / n) - Math.PI / 2;
      const radius = i % 2 === 0 ? r : innerR;
      const px = round(cx + Math.cos(a) * radius);
      const py = round(cy + Math.sin(a) * radius);
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
    g.strokePath();
    g.fillStyle(color, 1);
    g.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = (i * Math.PI / n) - Math.PI / 2;
      const radius = i % 2 === 0 ? r : innerR;
      const px = round(cx + Math.cos(a) * radius);
      const py = round(cy + Math.sin(a) * radius);
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
    g.fillPath();
    g.fillStyle(0xFFF8E0, 0.9);
    g.fillCircle(round(cx), round(cy), round(r * 0.2));
  }

  private drawLevelBadge(g: Phaser.GameObjects.Graphics, cx: number, cy: number, size: number, color: number): void {
    const w = size * 0.9;
    const h = size * 0.55;
    const r = 4;
    g.fillStyle(color, 1);
    g.fillRoundedRect(round(cx - w / 2), round(cy - h / 2), round(w), round(h), r);
    g.lineStyle(1.5, 0x5EEA8A, 0.85);
    g.strokeRoundedRect(round(cx - w / 2), round(cy - h / 2), round(w), round(h), r);
    const arrowW = w * 0.35;
    const arrowH = h * 0.5;
    g.fillStyle(0xFFFFFF, 1);
    g.beginPath();
    g.moveTo(round(cx), round(cy - arrowH / 2));
    g.lineTo(round(cx - arrowW / 2), round(cy + arrowH / 2));
    g.lineTo(round(cx), round(cy + arrowH / 4));
    g.lineTo(round(cx + arrowW / 2), round(cy + arrowH / 2));
    g.closePath();
    g.fillPath();
  }

  private drawHeart(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number, color: number): void {
    const rad = r * 0.52;
    const topOffset = r * 0.22;
    const leftCx = cx - r * 0.32;
    const rightCx = cx + r * 0.32;
    const circleCy = cy - topOffset;
    const tipY = cy + r * 0.82;
    g.fillStyle(color, 1);
    g.fillCircle(round(leftCx), round(circleCy), round(rad));
    g.fillCircle(round(rightCx), round(circleCy), round(rad));
    g.beginPath();
    g.moveTo(round(cx - rad), round(circleCy));
    g.lineTo(round(cx), round(tipY));
    g.lineTo(round(cx + rad), round(circleCy));
    g.closePath();
    g.fillPath();
    g.lineStyle(1.5, 0xB84040, 0.8);
    g.strokeCircle(round(leftCx), round(circleCy), round(rad));
    g.strokeCircle(round(rightCx), round(circleCy), round(rad));
    g.beginPath();
    g.moveTo(round(cx - rad), round(circleCy));
    g.lineTo(round(cx), round(tipY));
    g.lineTo(round(cx + rad), round(circleCy));
    g.closePath();
    g.strokePath();
    g.fillStyle(0xFFFFFF, 0.4);
    g.fillCircle(round(cx - r * 0.22), round(cy - r * 0.28), round(r * 0.18));
  }

  private createHUD(): void {
    const { width } = this.scene.cameras.main;
    const barW = round(width - MARGIN_SIDE * 2);
    const x = MARGIN_SIDE;
    const y = MARGIN_TOP;
    const third = barW / 3;
    const cy = round(y + BAR_HEIGHT / 2);

    this.barBg = this.scene.add.graphics();
    this.barBg.fillStyle(0x08080E, 0.97);
    this.barBg.fillRoundedRect(x, y, barW, BAR_HEIGHT, RADIUS);
    this.barBg.setScrollFactor(0);
    this.barBg.setDepth(HUD_DEPTH - 1);

    this.barBorder = this.scene.add.graphics();
    this.barBorder.lineStyle(1, 0x1A1A24, 1);
    this.barBorder.strokeRoundedRect(x, y, barW, BAR_HEIGHT, RADIUS);
    this.barBorder.lineStyle(1, 0xFFFFFF, 0.05);
    this.barBorder.strokeRoundedRect(x + 1, y + 1, barW - 2, BAR_HEIGHT - 2, RADIUS - 1);
    this.barBorder.fillStyle(0xFFFFFF, 0.04);
    this.barBorder.fillRect(x + 2, y + 2, barW - 4, 1);
    this.barBorder.setScrollFactor(0);
    this.barBorder.setDepth(HUD_DEPTH - 0.5);

    const scoreIconX = round(x + third * 0.5 - 38);
    const starIcon = this.scene.add.graphics();
    this.drawStar(starIcon, scoreIconX, cy, ICON_SIZE * 0.48, 0xFFD43B);
    starIcon.setScrollFactor(0);
    starIcon.setDepth(HUD_DEPTH);
    this.iconGraphics.push(starIcon);

    this.scoreText = this.scene.add.text(round(x + third * 0.5 - 6), cy, '0', {
      fontFamily: FONT,
      fontSize: '21px',
      color: '#FFD43B',
      fontStyle: '700',
      stroke: TEXT_STROKE,
      strokeThickness: TEXT_STROKE_THICK
    });
    this.scoreText.setOrigin(0, 0.5);
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(HUD_DEPTH);

    const div1 = this.scene.add.graphics();
    div1.lineStyle(1, 0x16161E, 1);
    div1.lineBetween(round(x + third), y + 10, round(x + third), y + BAR_HEIGHT - 10);
    div1.setScrollFactor(0);
    div1.setDepth(HUD_DEPTH - 0.3);
    this.dividers.push(div1);

    const levelIconX = round(x + third * 1.5 - 38);
    const levelIcon = this.scene.add.graphics();
    this.drawLevelBadge(levelIcon, levelIconX, cy, ICON_SIZE, 0x1E5631);
    levelIcon.setScrollFactor(0);
    levelIcon.setDepth(HUD_DEPTH);
    this.iconGraphics.push(levelIcon);

    this.levelText = this.scene.add.text(round(x + third * 1.5 - 6), cy, '1', {
      fontFamily: FONT,
      fontSize: '21px',
      color: '#4ADE80',
      fontStyle: '700',
      stroke: TEXT_STROKE,
      strokeThickness: TEXT_STROKE_THICK
    });
    this.levelText.setOrigin(0, 0.5);
    this.levelText.setScrollFactor(0);
    this.levelText.setDepth(HUD_DEPTH);

    const div2 = this.scene.add.graphics();
    div2.lineStyle(1, 0x16161E, 1);
    div2.lineBetween(round(x + third * 2), y + 10, round(x + third * 2), y + BAR_HEIGHT - 10);
    div2.setScrollFactor(0);
    div2.setDepth(HUD_DEPTH - 0.3);
    this.dividers.push(div2);

    const livesIconX = round(x + third * 2.5 - 38);
    const heartIcon = this.scene.add.graphics();
    this.drawHeart(heartIcon, livesIconX, cy, ICON_SIZE * 0.5, 0xEF4444);
    heartIcon.setScrollFactor(0);
    heartIcon.setDepth(HUD_DEPTH);
    this.iconGraphics.push(heartIcon);

    this.livesText = this.scene.add.text(round(x + third * 2.5 - 6), cy, '3', {
      fontFamily: FONT,
      fontSize: '21px',
      color: '#F87171',
      fontStyle: '700',
      stroke: TEXT_STROKE,
      strokeThickness: TEXT_STROKE_THICK
    });
    this.livesText.setOrigin(0, 0.5);
    this.livesText.setScrollFactor(0);
    this.livesText.setDepth(HUD_DEPTH);

    this.shieldX = round(x + barW - 28);
    this.shieldCy = cy;
  }

  private drawShieldIcon(g: Phaser.GameObjects.Graphics, cx: number, cy: number, size: number): void {
    const w = size * 0.9;
    const h = size * 1.1;
    g.fillStyle(0x3B82F6, 1);
    g.lineStyle(1.5, 0x60A5FA, 0.9);
    g.beginPath();
    g.moveTo(round(cx), round(cy - h / 2 + 2));
    g.lineTo(round(cx + w / 2 - 1), round(cy - h / 4));
    g.lineTo(round(cx + w / 2 - 1), round(cy + h / 4));
    g.lineTo(round(cx), round(cy + h / 2 - 2));
    g.lineTo(round(cx - w / 2 + 1), round(cy + h / 4));
    g.lineTo(round(cx - w / 2 + 1), round(cy - h / 4));
    g.closePath();
    g.fillPath();
    g.strokePath();
  }

  updateScore(score: number): void {
    this.scoreText.setText(String(score));
    this.scene.tweens.add({
      targets: this.scoreText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 70,
      yoyo: true,
      ease: 'Power2'
    });
  }

  updateLevel(level: number): void {
    this.levelText.setText(String(level));
    this.scene.tweens.add({
      targets: this.levelText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 120,
      yoyo: true,
      ease: 'Back.easeOut'
    });
  }

  updateLives(lives: number): void {
    this.livesText.setText(String(lives));
    if (lives >= 0) {
      this.scene.tweens.add({
        targets: this.livesText,
        alpha: 0.4,
        duration: 80,
        yoyo: true,
        repeat: 2
      });
    }
  }

  updateShield(shield: number): void {
    if (this.shieldGraphic) {
      this.shieldGraphic.destroy();
      this.shieldGraphic = null;
    }
    if (shield > 0) {
      this.shieldGraphic = this.scene.add.graphics();
      this.drawShieldIcon(this.shieldGraphic, this.shieldX, this.shieldCy, 18);
      this.shieldGraphic.setScrollFactor(0);
      this.shieldGraphic.setDepth(HUD_DEPTH);
    }
  }

  showScenarioText(title: string, color: string): void {
    const { width } = this.scene.cameras.main;
    const t = this.scene.add.text(round(width / 2), 60, title, {
      fontFamily: FONT,
      fontSize: '26px',
      color: color,
      fontStyle: '800',
      stroke: TEXT_STROKE,
      strokeThickness: 6
    });
    t.setOrigin(0.5);
    t.setScrollFactor(0);
    t.setDepth(HUD_DEPTH - 2);
    t.setScale(0);
    t.setAlpha(1);
    this.scene.tweens.add({
      targets: t,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 120,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: t,
          alpha: 0,
          scaleX: 1,
          scaleY: 1,
          duration: 500,
          delay: 350,
          ease: 'Power2',
          onComplete: () => t.destroy()
        });
      }
    });
  }

  showFloatingText(x: number, y: number, text: string, color: string = '#ffffff'): void {
    const tx = round(x);
    const ty = round(y);
    const floatingText = this.scene.add.text(tx, ty, text, {
      fontFamily: FONT,
      fontSize: '24px',
      color: color,
      fontStyle: '700',
      stroke: TEXT_STROKE,
      strokeThickness: TEXT_STROKE_THIN
    });
    floatingText.setOrigin(0.5);
    floatingText.setDepth(HUD_DEPTH - 2);
    floatingText.setScale(0.5);
    this.scene.tweens.add({
      targets: floatingText,
      y: ty - 48,
      scaleX: 1,
      scaleY: 1,
      alpha: 0,
      duration: 720,
      ease: 'Power2',
      onComplete: () => floatingText.destroy()
    });
  }

  showMissText(): void {
    const { width } = this.scene.cameras.main;
    const missText = this.scene.add.text(round(width / 2), 100, 'MISS!', {
      fontFamily: FONT,
      fontSize: '32px',
      color: '#EF4444',
      fontStyle: '800',
      stroke: TEXT_STROKE,
      strokeThickness: 6
    });
    missText.setOrigin(0.5);
    missText.setScrollFactor(0);
    missText.setDepth(HUD_DEPTH - 2);
    missText.setScale(0);
    this.scene.tweens.add({
      targets: missText,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 100,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: missText,
          alpha: 0,
          scaleX: 0.9,
          scaleY: 0.9,
          duration: 300,
          ease: 'Power2',
          onComplete: () => missText.destroy()
        });
      }
    });
  }

  showLevelUp(): void {
    const { width } = this.scene.cameras.main;
    const levelText = this.scene.add.text(round(width / 2), 60, 'LEVEL UP!', {
      fontFamily: FONT,
      fontSize: '28px',
      color: '#4ADE80',
      fontStyle: '800',
      stroke: TEXT_STROKE,
      strokeThickness: 6
    });
    levelText.setOrigin(0.5);
    levelText.setScrollFactor(0);
    levelText.setDepth(HUD_DEPTH - 2);
    levelText.setScale(0);
    levelText.setAlpha(1);
    this.scene.tweens.add({
      targets: levelText,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 130,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: levelText,
          alpha: 0,
          scaleX: 1,
          scaleY: 1,
          duration: 450,
          delay: 250,
          ease: 'Power2',
          onComplete: () => levelText.destroy()
        });
      }
    });
  }

  destroy(): void {
    this.scoreText.destroy();
    this.levelText.destroy();
    this.livesText.destroy();
    this.barBg.destroy();
    this.barBorder.destroy();
    this.iconGraphics.forEach((g) => g.destroy());
    this.dividers.forEach((d) => d.destroy());
    if (this.shieldGraphic) {
      this.shieldGraphic.destroy();
      this.shieldGraphic = null;
    }
    this.iconGraphics = [];
    this.dividers = [];
  }
}
