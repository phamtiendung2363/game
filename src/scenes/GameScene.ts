import Phaser from 'phaser';
import { HUD } from '../ui/HUD';
import { CONFIG } from '../config';
import {
  createAllItemTextures,
  getAllItemIcons,
  pickItemTypeByWeight,
  pickItemTypeGoldenRound,
  pickItemTypeStorm,
  pickItemTypePeace,
  pickItemTypeHeartRain,
  getGoodItemScore
} from '../utils/createEmojiTexture';
import {
  playBurst,
  playGroundBurst,
  playLoseLifeEffect,
  playLevelUpEffect,
  playShieldBlockEffect
} from '../utils/effects';

interface PooledItem extends Phaser.Physics.Arcade.Sprite {
  itemTypeId?: string;
}

export class GameScene extends Phaser.Scene {
  private basket!: Phaser.Physics.Arcade.Sprite;
  private itemPool: PooledItem[] = [];
  private activeItems: PooledItem[] = [];
  private hud!: HUD;
  
  private score = 0;
  private level = 1;
  private lives = CONFIG.startLives;
  private currentSpeed = CONFIG.startSpeed;
  private currentSpawnInterval = CONFIG.spawnInterval;
  
  private spawnTimer = 0;
  private ground!: Phaser.GameObjects.Rectangle;
  private groundEdge!: Phaser.GameObjects.Rectangle;
  private groundLine!: Phaser.GameObjects.Rectangle;
  private grassDark!: Phaser.GameObjects.Rectangle;
  private grassLight!: Phaser.GameObjects.Rectangle;
  
  private isGameOver = false;
  private gameOverContainer?: Phaser.GameObjects.Container;
  
  private targetBasketX = 0;
  private stars: Phaser.GameObjects.Graphics[] = [];
  private basketShadow!: Phaser.GameObjects.Ellipse;
  private comboCounter = 0;
  private shieldCount = 0;
  private goldenRoundEndTime = 0;
  private rushEndTime = 0;
  private stormEndTime = 0;
  private speedSpikeEndTime = 0;
  private slowUntil = 0;
  private shrinkEndTime = 0;
  private reverseEndTime = 0;
  private doubleSpawnEndTime = 0;
  private flashFloodEndTime = 0;
  private freezeEndTime = 0;
  private heartRainEndTime = 0;
  private wideBasketEndTime = 0;
  private slowFallEndTime = 0;
  private peaceEndTime = 0;
  private infiniteComboEndTime = 0;
  
  constructor() {
    super('GameScene');
  }

  init(): void {
    this.scale.on('resize', this.resize, this);
  }

  shutdown(): void {
    this.scale.off('resize', this.resize, this);
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Reset state khi Chơi lại (scene.restart() giữ cùng instance)
    this.itemPool = [];
    this.activeItems = [];
    this.stars = [];
    this.score = 0;
    this.level = 1;
    this.lives = CONFIG.startLives;
    this.currentSpeed = CONFIG.startSpeed;
    this.currentSpawnInterval = CONFIG.spawnInterval;
    this.spawnTimer = 0;
    this.isGameOver = false;
    this.targetBasketX = 0;
    this.comboCounter = 0;
    this.shieldCount = 0;
    this.goldenRoundEndTime = 0;
    this.rushEndTime = 0;
    this.stormEndTime = 0;
    this.speedSpikeEndTime = 0;
    this.slowUntil = 0;
    this.shrinkEndTime = 0;
    this.reverseEndTime = 0;
    this.doubleSpawnEndTime = 0;
    this.flashFloodEndTime = 0;
    this.freezeEndTime = 0;
    this.heartRainEndTime = 0;
    this.wideBasketEndTime = 0;
    this.slowFallEndTime = 0;
    this.peaceEndTime = 0;
    this.infiniteComboEndTime = 0;

    // Background gradient
    this.createGradientBackground(width, height);

    // Sao (ít + không tween vô hạn để tránh lag)
    this.createStars(12);

    // Texture chỉ tạo lần đầu (tránh trùng key khi restart)
    if (!this.textures.exists('basket')) {
      createAllItemTextures(this);
      this.createBasketTexture();
    }
    
    // Mặt đất - 3 lớp cỏ (đậm -> sáng)
    const groundH = 24;
    const groundY = height - groundH / 2;
    const c = CONFIG.colors;

    this.grassDark = this.add.rectangle(
      Math.round(width / 2),
      Math.round(groundY) + 4,
      width,
      groundH,
      c.grassDark
    );
    this.grassDark.setDepth(1);

    this.ground = this.add.rectangle(
      Math.round(width / 2),
      Math.round(groundY),
      width,
      groundH - 4,
      c.grassMid
    );
    this.ground.setDepth(1.5);

    this.grassLight = this.add.rectangle(
      Math.round(width / 2),
      height - groundH + 6,
      width,
      6,
      c.grassLight
    );
    this.grassLight.setDepth(2);

    this.groundEdge = this.add.rectangle(
      Math.round(width / 2),
      height - groundH + 2,
      width,
      3,
      c.grassEdge
    );
    this.groundEdge.setDepth(2.5);

    this.groundLine = this.add.rectangle(
      Math.round(width / 2),
      height - 1,
      width,
      2,
      c.grassEdge
    );
    this.groundLine.setDepth(2.5);

    // Bóng giỏ
    this.basketShadow = this.add.ellipse(
      Math.round(width / 2),
      height - 36,
      Math.round(CONFIG.basketSize * 0.8),
      12,
      0x000000,
      0.35
    );
    this.basketShadow.setDepth(9);
    
    // Giỏ hứng
    this.basket = this.physics.add.sprite(
      Math.round(width / 2),
      height - 60,
      'basket'
    );
    this.basket.setDisplaySize(CONFIG.basketSize, 48);
    this.basket.setCollideWorldBounds(true);
    this.basket.body!.setSize(CONFIG.basketSize, 48);
    this.basket.setDepth(10);
    
    // Initialize target position
    this.targetBasketX = this.basket.x;
    
    // Pool vật rơi (mới mỗi lần chơi)
    this.createItemPool(CONFIG.maxItemsOnScreen);
    
    // Setup input
    this.setupInput();
    
    // Create HUD
    this.hud = new HUD(this);
    this.hud.updateScore(this.score);
    this.hud.updateLevel(this.level);
    this.hud.updateLives(this.lives);
    this.hud.updateShield(0);
    
    // Setup collisions
    this.physics.add.overlap(
      this.basket,
      this.activeItems,
      this.collectItem as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
  }
  
  private createGradientBackground(w: number, h: number): void {
    const g = this.add.graphics();
    const W = Math.ceil(w);
    const H = Math.ceil(h);
    const c = CONFIG.colors;

    g.fillStyle(c.skyTop, 1);
    g.fillRect(0, 0, W, H * 0.35);
    g.fillStyle(c.skyMid, 1);
    g.fillRect(0, H * 0.35, W, H * 0.4);
    g.fillStyle(c.skyBottom, 1);
    g.fillRect(0, H * 0.75, W, H * 0.25);
    g.setDepth(0);
  }

  private createStars(count: number): void {
    const { width, height } = this.cameras.main;
    const maxY = height - 120;
    const c = CONFIG.colors;

    for (let i = 0; i < count; i++) {
      const star = this.add.graphics();
      const x = Math.floor(Phaser.Math.Between(0, width));
      const y = Math.floor(Phaser.Math.Between(0, maxY));
      const size = 1;
      const color = i % 2 === 0 ? c.starBright : c.starDim;
      star.fillStyle(color, 0.6);
      star.fillCircle(x, y, size);
      star.setDepth(0.5);
      this.stars.push(star);
    }
  }

  private createBasketTexture(): void {
    const g = this.add.graphics();
    const w = CONFIG.basketSize;
    const h = 48;
    const r = 10;
    const c = CONFIG.colors;

    g.fillStyle(c.basketDark, 1);
    g.fillRoundedRect(0, 8, w, h - 8, r);
    g.fillStyle(c.basket, 1);
    g.fillRoundedRect(2, 4, w - 4, h - 16, r - 2);
    g.fillStyle(c.basketHighlight, 0.4);
    g.fillRoundedRect(4, 6, w - 12, 12, 4);
    g.lineStyle(2, c.basketStroke, 0.95);
    g.strokeRoundedRect(2, 6, w - 4, h - 16, r - 2);
    g.generateTexture('basket', w, h);
    g.destroy();
  }
  
  private createItemPool(size: number): void {
    const icons = getAllItemIcons();
    const firstKey = icons[0]?.textureKey ?? 'item_0';
    for (let i = 0; i < size; i++) {
      const item = this.physics.add.sprite(-100, -100, firstKey) as PooledItem;
      item.setActive(false);
      item.setVisible(false);
      this.itemPool.push(item);
    }
  }
  
  private setupInput(): void {
    const { width } = this.cameras.main;
    
    // Enable input
    this.input.addPointer(2); // Support multi-touch
    
    // Touch/Mouse input (Đứng hình = không đổi vị trí, Đảo ngược = chạm trái → giỏ phải)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isGameOver) return;
      if (this.time.now < this.freezeEndTime) return;
      let worldX = pointer.x;
      if (this.time.now < this.reverseEndTime) worldX = width - worldX;
      this.targetBasketX = Phaser.Math.Clamp(worldX, CONFIG.basketSize / 2, width - CONFIG.basketSize / 2);
    });
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isGameOver) return;
      if (this.time.now < this.freezeEndTime) return;
      if (pointer.isDown) {
        let worldX = pointer.x;
        if (this.time.now < this.reverseEndTime) worldX = width - worldX;
        this.targetBasketX = Phaser.Math.Clamp(worldX, CONFIG.basketSize / 2, width - CONFIG.basketSize / 2);
      }
    });
    
    this.input.on('pointerup', () => {});
    
    // Debug: Log input events
    if (false) { // Set to true for debugging
      this.input.on('pointerdown', (p: any) => console.log('Down:', p.x, p.y));
      this.input.on('pointermove', (p: any) => console.log('Move:', p.x, p.y));
    }
  }
  
  private getItemFromPool(): PooledItem | null {
    for (const item of this.itemPool) {
      if (!item.active) {
        return item;
      }
    }
    return null;
  }
  
  private spawnItem(): void {
    if (this.activeItems.length >= CONFIG.maxItemsOnScreen) return;

    const item = this.getItemFromPool();
    if (!item) return;

    const { width } = this.cameras.main;
    const inGoldenRound = this.time.now < this.goldenRoundEndTime;
    const inStorm = this.time.now < this.stormEndTime;
    const inPeace = this.time.now < this.peaceEndTime;
    const inHeartRain = this.time.now < this.heartRainEndTime;
    const typeId = inGoldenRound
      ? pickItemTypeGoldenRound()
      : inStorm
        ? pickItemTypeStorm()
        : inPeace
          ? pickItemTypePeace()
          : inHeartRain
            ? pickItemTypeHeartRain()
            : pickItemTypeByWeight(this.level);
    const allIcons = getAllItemIcons();
    const choices = allIcons.filter((i) => i.typeId === typeId);
    const pick = choices[Phaser.Math.Between(0, choices.length - 1)];
    if (!pick) return;

    item.itemTypeId = typeId;
    item.setTexture(pick.textureKey);
    item.setDisplaySize(CONFIG.iconSize, CONFIG.iconSize);
    item.setActive(true);
    item.setVisible(true);
    item.setPosition(
      Phaser.Math.Between(CONFIG.iconSize, width - CONFIG.iconSize),
      -CONFIG.iconSize
    );
    const sc = CONFIG.scenarios;
    const inSpeedSpike = this.time.now < this.speedSpikeEndTime;
    const inSlowFall = this.time.now < this.slowFallEndTime;
    let speed = this.currentSpeed * (inSpeedSpike ? (sc.speedSpikeMultiplier ?? 1.5) : 1);
    if (inSlowFall) speed *= (sc.slowFallMultiplier ?? 0.65);
    item.setVelocityY(speed);
    item.setScale(0.6);
    item.setAlpha(0.9);

    this.tweens.add({
      targets: item,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 150,
      ease: 'Power2'
    });

    this.activeItems.push(item);
  }
  
  private collectItem(_basket: any, item: any): void {
    const pooledItem = item as PooledItem;
    if (!pooledItem.active || !pooledItem.itemTypeId) return;

    const type = CONFIG.itemTypes.find((t) => t.id === pooledItem.itemTypeId);
    if (!type) return;

    const bx = pooledItem.x;
    const by = pooledItem.y;

    pooledItem.setVisible(false);
    playBurst(this, bx, by, type.id);

    this.tweens.add({
      targets: this.basket,
      scaleY: 0.92,
      duration: 80,
      yoyo: true,
      ease: 'Power2'
    });

    const isGoodType = ['basic', 'high', 'bonus', 'luck'].includes(type.id);
    let scoreDelta = isGoodType ? getGoodItemScore() : type.score;
    const inGoldenRound = this.time.now < this.goldenRoundEndTime;
    const inInfiniteCombo = this.time.now < this.infiniteComboEndTime;
    if (inGoldenRound && isGoodType) scoreDelta *= 2;
    if (inInfiniteCombo && isGoodType) scoreDelta *= 2;

    if (type.id === 'luck' && 'comboStacks' in type && type.comboStacks) {
      this.comboCounter = type.comboStacks;
    }
    if (this.comboCounter > 0 && isGoodType && !inInfiniteCombo) {
      scoreDelta *= 2;
      this.comboCounter--;
    }

    this.score = Math.max(0, this.score + scoreDelta);

    if (scoreDelta >= 0) {
      this.hud.showFloatingText(bx, by, `+${scoreDelta}`, '#FFE066');
    } else {
      this.hud.showFloatingText(bx, by, `${scoreDelta}`, '#FF6B6B');
    }

    if (type.id === 'shield') {
      const maxSh = CONFIG.scenarios.maxShields;
      this.shieldCount = Math.min(maxSh, this.shieldCount + 1);
      this.hud.updateShield(this.shieldCount);
    }
    if (type.id === 'slow') {
      const duration = CONFIG.scenarios.slowDuration ?? 10000;
      this.slowUntil = this.time.now + duration;
      this.hud.showFloatingText(bx, by, '🐌 Chậm!', '#AAAAAA');
    }
    if (type.life > 0) {
      this.lives = Math.min(CONFIG.startLives + 2, this.lives + type.life);
      this.hud.updateLives(this.lives);
    }
    if (type.life < 0) {
      if (this.shieldCount > 0) {
        this.shieldCount--;
        this.hud.updateShield(this.shieldCount);
        playShieldBlockEffect(this);
        this.hud.showFloatingText(bx, by, '🛡️', '#6B9FFF');
      } else {
        this.lives = Math.max(0, this.lives + type.life);
        this.hud.updateLives(this.lives);
        playLoseLifeEffect(this);
        if (this.lives <= 0) this.triggerGameOver();
      }
    }

    this.hud.updateScore(this.score);
    this.checkLevelUp();
    this.returnItemToPool(pooledItem);
  }
  
  private returnItemToPool(item: PooledItem): void {
    this.tweens.killTweensOf(item);
    item.setActive(false);
    item.setVisible(false);
    item.setPosition(-100, -100);
    item.setVelocity(0, 0);
    item.setScale(1);
    item.setAlpha(1);
    item.setAngle(0);
    item.itemTypeId = undefined;
    const idx = this.activeItems.indexOf(item);
    if (idx > -1) this.activeItems.splice(idx, 1);
  }
  
  private checkLevelUp(): void {
    const newLevel = Math.floor(this.score / CONFIG.pointsPerLevel) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      this.hud.updateLevel(this.level);
      this.hud.showLevelUp();
      playLevelUpEffect(this);

      // Increase difficulty
      this.currentSpeed = Math.min(
        CONFIG.startSpeed + (this.level - 1) * CONFIG.speedIncreasePerLevel,
        CONFIG.maxSpeed
      );
      
      this.currentSpawnInterval = Math.max(
        CONFIG.spawnInterval - (this.level - 1) * CONFIG.spawnDecreasePerLevel,
        CONFIG.minSpawnInterval
      );
      
      // Update active items speed (kể cả đang Tốc độ / Hỗn loạn)
      const inSpike = this.time.now < this.speedSpikeEndTime;
      const effSpeed = this.currentSpeed * (inSpike ? (CONFIG.scenarios.speedSpikeMultiplier ?? 1.5) : 1);
      this.activeItems.forEach(item => {
        if (item.active) item.setVelocityY(effSpeed);
      });

      const sc = CONFIG.scenarios;
      const now = this.time.now;
      if (this.level % sc.goldenRoundEveryLevels === 0) {
        this.goldenRoundEndTime = now + sc.goldenRoundDuration;
        this.hud.showScenarioText('HIỆP VÀNG!', '#FFE066');
      }
      if (this.level % sc.rushEveryLevels === 0) {
        this.rushEndTime = now + sc.rushDuration;
        this.hud.showScenarioText('ĐỢT SÓNG!', '#4ADE80');
      }
      // Kịch bản CỰC KHÓ
      const chaosLevels = sc.chaosEveryLevels ?? 7;
      const stormLevels = sc.stormEveryLevels ?? 3;
      const spikeLevels = sc.speedSpikeEveryLevels ?? 4;
      if (this.level % chaosLevels === 0) {
        this.stormEndTime = now + (sc.stormDuration ?? 6000);
        this.speedSpikeEndTime = now + (sc.speedSpikeDuration ?? 8000);
        this.hud.showScenarioText('HỖN LOẠN!', '#FF4444');
      } else {
        if (this.level % stormLevels === 0) {
          this.stormEndTime = now + (sc.stormDuration ?? 6000);
          this.hud.showScenarioText('BÃO!', '#FF8844');
        }
        if (this.level % spikeLevels === 0) {
          this.speedSpikeEndTime = now + (sc.speedSpikeDuration ?? 8000);
          this.hud.showScenarioText('TỐC ĐỘ!', '#FFAA00');
        }
      }
      // CỰC KHÓ thêm: Giỏ nhỏ, Đảo ngược, Spawn x2, Lũ quét, Giỏ chậm, Đứng hình
      if (this.level % (sc.shrinkEveryLevels ?? 6) === 0) {
        this.shrinkEndTime = now + (sc.shrinkDuration ?? 6000);
        this.hud.showScenarioText('GIỎ NHỎ!', '#FF6688');
      }
      if (this.level % (sc.reverseEveryLevels ?? 5) === 0) {
        this.reverseEndTime = now + (sc.reverseDuration ?? 6000);
        this.hud.showScenarioText('ĐẢO NGƯỢC!', '#AA66FF');
      }
      if (this.level % (sc.doubleSpawnEveryLevels ?? 8) === 0) {
        this.doubleSpawnEndTime = now + (sc.doubleSpawnDuration ?? 6000);
        this.hud.showScenarioText('SPAWN x2!', '#FF4444');
      }
      if (this.level % (sc.flashFloodEveryLevels ?? 9) === 0) {
        this.flashFloodEndTime = now + (sc.flashFloodDuration ?? 5000);
        this.hud.showScenarioText('LŨ QUÉT!', '#4488FF');
      }
      if (this.level % (sc.slugScenarioEveryLevels ?? 6) === 0) {
        this.slowUntil = Math.max(this.slowUntil, now + (sc.slugScenarioDuration ?? 6000));
        this.hud.showScenarioText('GIỎ CHẬM!', '#88AA88');
      }
      if (this.level % (sc.freezeEveryLevels ?? 10) === 0) {
        this.freezeEndTime = now + (sc.freezeDuration ?? 4000);
        this.hud.showScenarioText('ĐỨNG HÌNH!', '#6666AA');
      }
      // Cân bằng: kịch bản CÓ LỢI
      if (this.level % (sc.heartRainEveryLevels ?? 5) === 0) {
        this.heartRainEndTime = now + (sc.heartRainDuration ?? 6000);
        this.hud.showScenarioText('TRÁI TIM RƠI!', '#FF6B6B');
      }
      if (this.level % (sc.wideBasketEveryLevels ?? 4) === 0) {
        this.wideBasketEndTime = now + (sc.wideBasketDuration ?? 8000);
        this.hud.showScenarioText('GIỎ RỘNG!', '#4ADE80');
      }
      if (this.level % (sc.slowFallEveryLevels ?? 6) === 0) {
        this.slowFallEndTime = now + (sc.slowFallDuration ?? 6000);
        this.hud.showScenarioText('RƠI CHẬM!', '#88CCFF');
      }
      if (this.level % (sc.peaceEveryLevels ?? 4) === 0) {
        this.peaceEndTime = now + (sc.peaceDuration ?? 6000);
        this.hud.showScenarioText('BÌNH YÊN!', '#AAFFAA');
      }
      if (this.level % (sc.infiniteComboEveryLevels ?? 7) === 0) {
        this.infiniteComboEndTime = now + (sc.infiniteComboDuration ?? 8000);
        this.hud.showScenarioText('COMBO x2!', '#FFE066');
      }
      if (this.level % (sc.bonusLifeEveryLevels ?? 10) === 0) {
        this.lives = Math.min(5, this.lives + 1);
        this.hud.updateLives(this.lives);
        this.hud.showScenarioText('+1 MẠNG!', '#FF6B6B');
      }
    }
  }
  
  private loseLife(): void {
    if (this.shieldCount > 0) {
      this.shieldCount--;
      this.hud.updateShield(this.shieldCount);
      playShieldBlockEffect(this);
      this.hud.showMissText(); // vẫn hiện MISS nhưng không mất mạng
      return;
    }
    this.lives--;
    this.hud.updateLives(this.lives);
    playLoseLifeEffect(this);
    if (this.lives <= 0) this.triggerGameOver();
  }
  
  private triggerGameOver(): void {
    this.isGameOver = true;
    
    // Stop all items
    this.activeItems.forEach(item => {
      item.setVelocity(0, 0);
    });
    
    // Save best score
    const bestScore = parseInt(localStorage.getItem('bestScore') || '0');
    if (this.score > bestScore) {
      localStorage.setItem('bestScore', this.score.toString());
    }
    
    this.showGameOverScreen();
  }
  
  private showGameOverScreen(): void {
    const { width, height } = this.cameras.main;
    const c = CONFIG.colors;
    const FONT = "'Plus Jakarta Sans', -apple-system, sans-serif";

    const overlay = this.add.rectangle(
      Math.round(width / 2),
      Math.round(height / 2),
      width,
      height,
      0x050508,
      0.96
    );
    overlay.setScrollFactor(0);
    overlay.setDepth(200);

    this.gameOverContainer = this.add.container(
      Math.round(width / 2),
      Math.round(height / 2)
    );
    this.gameOverContainer.setScrollFactor(0);
    this.gameOverContainer.setDepth(201);

    const panelW = 300;
    const panelH = 340;
    const panelR = 20;
    const px = -panelW / 2;
    const py = -panelH / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x0A0A12, 0.99);
    panel.fillRoundedRect(px, py, panelW, panelH, panelR);
    panel.lineStyle(1, 0x1A1A24, 1);
    panel.strokeRoundedRect(px, py, panelW, panelH, panelR);
    panel.lineStyle(1, 0xFFFFFF, 0.04);
    panel.strokeRoundedRect(px + 1, py + 1, panelW - 2, panelH - 2, panelR - 1);
    panel.fillStyle(0xFFFFFF, 0.035);
    panel.fillRect(px + 3, py + 3, panelW - 6, 1);
    panel.setScrollFactor(0);
    this.gameOverContainer.add(panel);

    const gameOverText = this.add.text(0, -122, 'GAME OVER', {
      fontFamily: FONT,
      fontSize: '42px',
      color: '#EF4444',
      fontStyle: '800',
      stroke: '#000000',
      strokeThickness: 6
    });
    gameOverText.setOrigin(0.5);

    const scoreText = this.add.text(0, -54, `Score: ${this.score}`, {
      fontFamily: FONT,
      fontSize: '28px',
      color: '#FCD34D',
      fontStyle: '700',
      stroke: '#000000',
      strokeThickness: 5
    });
    scoreText.setOrigin(0.5);

    const levelText = this.add.text(0, -8, `Level ${this.level}`, {
      fontFamily: FONT,
      fontSize: '22px',
      color: '#4ADE80',
      fontStyle: '700',
      stroke: '#000000',
      strokeThickness: 4
    });
    levelText.setOrigin(0.5);

    const bestScore = parseInt(localStorage.getItem('bestScore') || '0');
    const bestText = this.add.text(0, 34, `Best: ${bestScore}`, {
      fontFamily: FONT,
      fontSize: '22px',
      color: '#E5E7EB',
      fontStyle: '600',
      stroke: '#000000',
      strokeThickness: 4
    });
    bestText.setOrigin(0.5);

    const btnW = 200;
    const btnH = 56;
    const btnR = 16;
    const btnY = 94;

    const buttonBg = this.add.graphics();
    const drawButton = (fill: number, stroke: number) => {
      buttonBg.clear();
      buttonBg.fillStyle(fill, 1);
      buttonBg.fillRoundedRect(-btnW / 2, btnY, btnW, btnH, btnR);
      buttonBg.lineStyle(2, stroke, 1);
      buttonBg.strokeRoundedRect(-btnW / 2, btnY, btnW, btnH, btnR);
    };
    drawButton(0x22C55E, 0x4ADE80);
    buttonBg.setInteractive(
      new Phaser.Geom.Rectangle(-btnW / 2, btnY, btnW, btnH),
      Phaser.Geom.Rectangle.Contains
    );
    buttonBg.setScrollFactor(0);

    const buttonText = this.add.text(0, btnY + btnH / 2, 'CHƠI LẠI', {
      fontFamily: FONT,
      fontSize: '24px',
      color: '#052E16',
      fontStyle: '800',
      stroke: '#000000',
      strokeThickness: 2
    });
    buttonText.setOrigin(0.5);

    buttonBg.on('pointerdown', () => this.scene.restart());
    buttonBg.on('pointerover', () => {
      drawButton(0x4ADE80, 0x86EFAC);
      this.tweens.add({ targets: buttonText, scaleX: 1.03, scaleY: 1.03, duration: 80, ease: 'Power2' });
    });
    buttonBg.on('pointerout', () => {
      drawButton(0x22C55E, 0x4ADE80);
      this.tweens.add({ targets: buttonText, scaleX: 1, scaleY: 1, duration: 80, ease: 'Power2' });
    });

    this.gameOverContainer.add([
      gameOverText,
      scoreText,
      levelText,
      bestText,
      buttonBg,
      buttonText
    ]);
  }
  
  private resize(gameSize: Phaser.Structs.Size): void {
    const width = gameSize.width;
    const height = gameSize.height;
    
    this.cameras.resize(width, height);
    
    if (this.basket) {
      this.basket.y = height - 58;
      this.targetBasketX = this.basket.x;
    }
    if (this.basketShadow) this.basketShadow.y = height - 36;
    const groundH = 24;
    if (this.grassDark) {
      this.grassDark.y = height - groundH / 2 + 4;
      this.grassDark.width = width;
      this.grassDark.x = width / 2;
    }
    if (this.ground) {
      this.ground.y = height - groundH / 2;
      this.ground.width = width;
      this.ground.x = width / 2;
    }
    if (this.grassLight) {
      this.grassLight.y = height - groundH + 6;
      this.grassLight.width = width;
      this.grassLight.x = width / 2;
    }
    if (this.groundEdge) {
      this.groundEdge.y = height - groundH + 2;
      this.groundEdge.width = width;
      this.groundEdge.x = width / 2;
    }
    if (this.groundLine) {
      this.groundLine.y = height - 1;
      this.groundLine.width = width;
      this.groundLine.x = width / 2;
    }
    
    if (this.hud) {
      this.hud.destroy();
      this.hud = new HUD(this);
      this.hud.updateScore(this.score);
      this.hud.updateLevel(this.level);
      this.hud.updateLives(this.lives);
      this.hud.updateShield(this.shieldCount);
    }
  }
  
  update(_time: number, delta: number): void {
    if (this.isGameOver) return;
    
    const { width, height } = this.cameras.main;
    
    const sc = CONFIG.scenarios;
    // Giỏ nhỏ / Giỏ rộng (cân bằng)
    const isShrunk = this.time.now < this.shrinkEndTime;
    const isWide = this.time.now < this.wideBasketEndTime;
    const basketScale = isShrunk ? (sc.shrinkScale ?? 0.65) : isWide ? (sc.wideBasketScale ?? 1.35) : 1;
    const basketW = CONFIG.basketSize * basketScale;
    const basketH = 48 * basketScale;
    this.basket.setDisplaySize(basketW, basketH);
    this.basket.body!.setSize(basketW, basketH);
    // Đứng hình: không cho giỏ di chuyển
    if (this.time.now < this.freezeEndTime) this.targetBasketX = this.basket.x;
    // Smooth basket movement (bị 🐌 làm chậm 10s khi hứng)
    const isSlowed = this.time.now < this.slowUntil;
    const lerpMult = isSlowed ? (sc.slowLerpMultiplier ?? 0.2) : 1;
    const lerpSpeed = CONFIG.basketLerpSpeed * lerpMult;
    this.basket.x += (this.targetBasketX - this.basket.x) * lerpSpeed;
    if (this.basketShadow) this.basketShadow.x = this.basket.x;
    this.basket.x = Phaser.Math.Clamp(this.basket.x, basketW / 2, width - basketW / 2);
    
    // Tốc độ rơi hiệu dụng (Tốc độ spike / Rơi chậm có lợi)
    const inSpike = this.time.now < this.speedSpikeEndTime;
    const inSlowFall = this.time.now < this.slowFallEndTime;
    let effSpeed = this.currentSpeed * (inSpike ? (CONFIG.scenarios.speedSpikeMultiplier ?? 1.5) : 1);
    if (inSlowFall) effSpeed *= (sc.slowFallMultiplier ?? 0.65);
    this.activeItems.forEach(item => {
      if (item.active) item.setVelocityY(effSpeed);
    });
    
    // Spawn items (Đợt sóng, Bão, Lũ quét, Spawn x2)
    const inRush = this.time.now < this.rushEndTime;
    const inStorm = this.time.now < this.stormEndTime;
    const inFlashFlood = this.time.now < this.flashFloodEndTime;
    const inDoubleSpawn = this.time.now < this.doubleSpawnEndTime;
    let interval = this.currentSpawnInterval;
    if (inRush) interval *= 0.5;
    if (inStorm) interval /= (sc.stormSpawnMultiplier ?? 1.6);
    if (inFlashFlood) interval *= (sc.flashFloodIntervalMult ?? 0.4);
    this.spawnTimer += delta;
    if (this.spawnTimer >= interval) {
      this.spawnItem();
      if (inDoubleSpawn) this.spawnItem();
      this.spawnTimer = 0;
    }
    
    // Vật chạm đất: nổ ngay rồi biến mất
    const groundY = height - 22;
    for (let i = this.activeItems.length - 1; i >= 0; i--) {
      const item = this.activeItems[i];
      if (item.y >= groundY) {
        const gx = item.x;
        item.setVisible(false);
        playGroundBurst(this, gx, groundY);
        if (item.itemTypeId) {
          const type = CONFIG.itemTypes.find((t) => t.id === item.itemTypeId);
          if (type && type.missLife > 0) {
            this.loseLife();
            this.hud.showMissText();
          }
        }
        this.returnItemToPool(item);
      }
    }
  }
}
