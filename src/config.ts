// Game configuration and difficulty settings
export const CONFIG = {
  // Canvas settings (Portrait mode - màn hình dọc)
  width: 375,   // Chiều ngang hẹp (mobile width)
  height: 667,  // Chiều cao dài (iPhone size)
  
  // Difficulty settings (cân bằng: không quá khó)
  startSpeed: 200,           // Initial fall speed (pixels/sec)
  speedIncreasePerLevel: 28,  // Tốc độ tăng vừa phải mỗi level
  maxSpeed: 480,              // Maximum fall speed
  
  spawnInterval: 1200,       // Base spawn interval (ms)
  spawnDecreasePerLevel: 45,  // Giảm chậm hơn mỗi level
  minSpawnInterval: 500,      // Không spawn dày quá
  
  maxItemsOnScreen: 22,      // Giới hạn vật trên màn (tối ưu FPS)
  
  // Score settings
  pointsPerLevel: 50,        // 50 điểm thì tăng 1 level
  // Vật ăn được (tốt): chỉ 1–5 điểm, xác suất 5 điểm = 1%
  goodItemScore: {
    min: 1,
    max: 5,
    chanceFive: 0.01,       // 1% ra 5 điểm
    chanceFour: 0.09,       // 9% ra 4
    chanceThree: 0.2,       // 20% ra 3
    chanceTwo: 0.3,         // 30% ra 2
    chanceOne: 0.4          // 40% ra 1 (còn lại)
  },

  // Lives settings
  startLives: 3,             // Starting lives

  // Loại vật phẩm: id, icons, điểm khi hứng, mạng khi hứng, mạng khi miss (rơi đất)
  itemTypes: [
    { id: 'basic', icons: ['⭐', '✨', '🌟'], score: 10, life: 0, missLife: 1 },
    { id: 'high', icons: ['💎', '🪙', '💰'], score: 30, life: 0, missLife: 1 },
    { id: 'bonus', icons: ['🎁'], score: 50, life: 0, missLife: 1 },
    { id: 'luck', icons: ['🍀'], score: 15, life: 0, missLife: 1, comboStacks: 3 },
    { id: 'heavyPenalty', icons: ['💣', '🧨', '💥'], score: -30, life: 0, missLife: 0 },
    { id: 'quickPenalty', icons: ['⚡', '🔥'], score: -15, life: 0, missLife: 0 },
    { id: 'loseLife', icons: ['☠️', '☢️', '☣️'], score: -25, life: -1, missLife: 0 },
    { id: 'obstacle', icons: ['🧱'], score: 0, life: -1, missLife: 0 },
    { id: 'extraLife', icons: ['❤️'], score: 0, life: 1, missLife: 0 },
    { id: 'shield', icons: ['🛡️'], score: 0, life: 0, missLife: 0 },
    { id: 'slow', icons: ['🐌'], score: 0, life: 0, missLife: 0 }
  ] as const,

  // Tỉ lệ spawn (tổng = 100) — cân bằng: nhiều vật tốt, ít vật xấu
  itemTypeWeights: {
    basic: 30,
    high: 13,
    bonus: 6,
    luck: 8,
    heavyPenalty: 8,
    quickPenalty: 10,
    loseLife: 6,
    obstacle: 6,
    extraLife: 6,
    shield: 5,
    slow: 2
  },

  // Kịch bản đặc biệt
  scenarios: {
    goldenRoundEveryLevels: 2,   // Mỗi 2 level có 1 hiệp vàng
    goldenRoundDuration: 8000,   // 8 giây: chỉ vật tốt, điểm x2
    rushEveryLevels: 5,          // Mỗi 5 level có đợt sóng
    rushDuration: 5000,          // 5 giây: spawn dày gấp đôi
    maxShields: 1,               // Tối đa 1 lá chắn
    hardModeFromLevel: 10,       // Chế độ khó chỉ từ level 10 (trước đó dễ hơn)
    chaosEveryLevels: 10,        // Hỗn loạn mỗi 10 level (ít hơn)
    slowDuration: 8000,         // Vật 🐌: 8 giây chậm (bớt khó)
    slowLerpMultiplier: 0.25,   // Chậm vừa phải
    // Kịch bản khó — ít thường xuyên / ngắn hơn / nhẹ hơn
    stormEveryLevels: 5,
    stormDuration: 5000,
    stormSpawnMultiplier: 1.35,
    speedSpikeEveryLevels: 6,
    speedSpikeDuration: 6000,
    speedSpikeMultiplier: 1.3,
    shrinkEveryLevels: 8,
    shrinkDuration: 5000,
    shrinkScale: 0.75,
    reverseEveryLevels: 7,
    reverseDuration: 5000,
    doubleSpawnEveryLevels: 12,
    doubleSpawnDuration: 5000,
    flashFloodEveryLevels: 12,
    flashFloodDuration: 4000,
    flashFloodIntervalMult: 0.55,
    slugScenarioEveryLevels: 8,
    slugScenarioDuration: 5000,
    freezeEveryLevels: 15,
    freezeDuration: 3000,
    // Kịch bản CÓ LỢI — thường xuyên hơn / dài hơn
    heartRainEveryLevels: 4,
    heartRainDuration: 7000,
    wideBasketEveryLevels: 3,
    wideBasketDuration: 9000,
    wideBasketScale: 1.4,
    slowFallEveryLevels: 5,
    slowFallDuration: 7000,
    slowFallMultiplier: 0.6,
    peaceEveryLevels: 3,
    peaceDuration: 7000,
    infiniteComboEveryLevels: 5,
    infiniteComboDuration: 9000,
    bonusLifeEveryLevels: 8
  },
  // Chế độ khó (level >= 10) — vẫn cân bằng hơn trước
  itemTypeWeightsHard: {
    basic: 22,
    high: 10,
    bonus: 5,
    luck: 7,
    heavyPenalty: 12,
    quickPenalty: 12,
    loseLife: 8,
    obstacle: 8,
    extraLife: 6,
    shield: 6,
    slow: 4
  },

  // Basket settings
  basketSpeed: 800,
  basketSize: 70,

  maxDPR: 2,

  colors: {
    // Bầu trời
    skyTop: 0x050510,
    skyMid: 0x12102A,
    skyBottom: 0x1A1535,
    starBright: 0xFFF8E7,
    starDim: 0xC4B8E8,
    // Giỏ
    basket: 0xFFB366,
    basketDark: 0xE85D1F,
    basketHighlight: 0xFFE0B2,
    basketStroke: 0xFFFFFF,
    // Đất / cỏ
    grassDark: 0x0D2818,
    grassMid: 0x134D2A,
    grassLight: 0x1E7B3C,
    grassEdge: 0x2EAA55,
    // HUD
    hudBg: 0x0A0A10,
    hudBorder: 0x252535,
    hudBorderBright: 0x3A3A50,
    scoreColor: 0xFFE066,
    levelColor: 0x4ADE80,
    livesColor: 0xFF6B6B,
    textLight: 0xF0F2F5,
    overlay: 0x050508
  },

  iconSize: 32,
  
  // Movement interpolation
  basketLerpSpeed: 0.25
};
