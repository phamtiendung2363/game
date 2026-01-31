import Phaser from 'phaser';

/** Nổ nhẹ (ít hạt, thời gian ngắn) để tránh lag */
const BURST_BY_TYPE: Record<string, { colors: number[]; count: number; radius: number }> = {
  basic: { colors: [0xFFE066], count: 4, radius: 28 },
  high: { colors: [0x4ADE80], count: 5, radius: 30 },
  bonus: { colors: [0xFFE066], count: 5, radius: 32 },
  luck: { colors: [0x4ADE80], count: 4, radius: 28 },
  heavyPenalty: { colors: [0xFF4444], count: 5, radius: 32 },
  quickPenalty: { colors: [0xFFAA00], count: 4, radius: 28 },
  loseLife: { colors: [0xFF0000], count: 5, radius: 35 },
  obstacle: { colors: [0x666666], count: 4, radius: 28 },
  extraLife: { colors: [0xFF6B6B], count: 5, radius: 32 },
  shield: { colors: [0x6B9FFF], count: 5, radius: 30 },
  slow: { colors: [0x8B7355], count: 4, radius: 26 }
};

const GROUND_BURST = { colors: [0x654321], count: 4, radius: 24 };

const PI2 = Math.PI * 2;

export function playBurst(
  scene: Phaser.Scene,
  x: number,
  y: number,
  typeId: string,
  onComplete?: () => void
): void {
  const cfg = BURST_BY_TYPE[typeId] || BURST_BY_TYPE.basic;
  const depth = 50;
  let done = 0;
  const n = cfg.count;

  for (let i = 0; i < n; i++) {
    const angle = (i / n) * PI2;
    const color = cfg.colors[i % cfg.colors.length];
    const particle = scene.add.circle(x, y, 3, color);
    particle.setDepth(depth);

    const tx = x + Math.cos(angle) * cfg.radius;
    const ty = y + Math.sin(angle) * cfg.radius;

    scene.tweens.add({
      targets: particle,
      x: tx,
      y: ty,
      alpha: 0,
      duration: 220,
      ease: 'Power2',
      onComplete: () => {
        particle.destroy();
        done++;
        if (done === n && onComplete) onComplete();
      }
    });
  }
  if (n === 0 && onComplete) onComplete();
}

export function playGroundBurst(scene: Phaser.Scene, x: number, y: number): void {
  const cfg = GROUND_BURST;
  const n = cfg.count;
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * PI2;
    const color = cfg.colors[0];
    const particle = scene.add.circle(x, y, 3, color);
    particle.setDepth(45);

    scene.tweens.add({
      targets: particle,
      x: x + Math.cos(angle) * cfg.radius,
      y: y + Math.sin(angle) * cfg.radius * 0.5,
      alpha: 0,
      duration: 180,
      ease: 'Power2',
      onComplete: () => particle.destroy()
    });
  }
}

export function playLoseLifeEffect(scene: Phaser.Scene): void {
  scene.cameras.main.shake(120, 0.005);
  scene.cameras.main.flash(100, 255, 50, 50, false, undefined, 0.3);
}

export function playLevelUpEffect(scene: Phaser.Scene): void {
  scene.cameras.main.flash(150, 255, 224, 102, false, undefined, 0.25);
}

export function playShieldBlockEffect(scene: Phaser.Scene): void {
  scene.cameras.main.shake(80, 0.003);
  scene.cameras.main.flash(120, 107, 159, 255, false, undefined, 0.2);
}
