# Phaser 3 Catch Game

Game 2D hứng vật phẩm rơi, được tối ưu hóa cho mobile (đặc biệt là iPhone Safari).

## 🎮 Gameplay

- Di chuyển rổ (basket) để hứng vật phẩm rơi từ trên xuống
- **Good items (màu xanh)**: +10 điểm khi hứng, -1 mạng khi miss
- **Bad items (màu đỏ)**: -15 điểm khi hứng, không trừ mạng khi miss
- Cứ 100 điểm sẽ lên 1 level, tốc độ rơi và spawn rate tăng
- Hết mạng → Game Over

## 🚀 Cài đặt & Chạy

### Yêu cầu
- Node.js 18 hoặc 20
- npm hoặc yarn

### Development
```bash
npm install
npm run dev
```

Game sẽ chạy tại `http://localhost:3000`

### Build cho Production
```bash
npm run build
```

Output sẽ nằm trong folder `dist/`:
- `dist/index.html`
- `dist/assets/`

## 📦 Deploy lên Cloudflare Pages

### Cách 1: Qua Dashboard
1. Đăng nhập [Cloudflare Pages](https://pages.cloudflare.com/)
2. Chọn "Create a project" → "Connect to Git"
3. Chọn repository của bạn
4. Cấu hình build:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version**: `18` hoặc `20`
5. Nhấn "Save and Deploy"

### Cách 2: Qua Wrangler CLI
```bash
npm install -g wrangler
npm run build
wrangler pages deploy dist
```

## ⚙️ Cấu hình Difficulty

Tất cả thông số game có thể điều chỉnh trong `src/config.ts`:

```typescript
export const CONFIG = {
  // Tốc độ rơi
  startSpeed: 100,              // Tốc độ ban đầu (pixels/sec)
  speedIncreasePerLevel: 20,    // Tăng tốc mỗi level
  maxSpeed: 400,                // Tốc độ tối đa
  
  // Spawn rate
  spawnInterval: 1500,          // Khoảng thời gian spawn (ms)
  spawnDecreasePerLevel: 50,    // Giảm mỗi level
  minSpawnInterval: 500,        // Tối thiểu
  
  maxItemsOnScreen: 30,         // Giới hạn vật phẩm trên màn
  
  // Điểm số
  goodItemScore: 10,            // Điểm khi hứng good item
  badItemScore: -15,            // Trừ điểm khi hứng bad item
  pointsPerLevel: 100,          // Điểm để lên level
  
  // Mạng
  startLives: 3,                // Số mạng ban đầu
  
  // Tỉ lệ spawn
  goodItemWeight: 0.7,          // 70% good items
  badItemWeight: 0.3,           // 30% bad items
  
  // Basket
  basketSpeed: 600,             // Tốc độ di chuyển
  basketSize: 80,               // Kích thước rổ
};
```

## 🎯 Tối ưu Mobile

Game đã được tối ưu cho mobile:
- ✅ WebGL renderer
- ✅ DPR giới hạn tối đa 2 (tránh quá tải GPU)
- ✅ Scale mode FIT + CENTER_BOTH
- ✅ Antialias: false, roundPixels: true
- ✅ Object pooling cho items (không tạo/destroy liên tục)
- ✅ Giới hạn max items trên màn hình
- ✅ Không dùng hiệu ứng nặng
- ✅ Touch controls mượt mà

## 📱 Điều khiển

- **Mobile**: Chạm và kéo ngón tay để di chuyển rổ
- **Desktop**: Click chuột hoặc di chuyển chuột

## 🏗️ Cấu trúc Project

```
d:\game\
├── index.html              # Entry point
├── src/
│   ├── main.ts            # Phaser config & khởi tạo
│   ├── config.ts          # Game settings
│   ├── scenes/
│   │   └── GameScene.ts   # Main game logic
│   └── ui/
│       └── HUD.ts         # UI overlay
├── public/                # Static assets (nếu cần)
├── dist/                  # Build output
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎨 Features

- ✅ Object pooling hiệu quả
- ✅ HUD cố định không bị ảnh hưởng camera
- ✅ Floating text khi hứng items
- ✅ Level system với difficulty tăng dần
- ✅ Lives system
- ✅ Game Over screen với Best Score (localStorage)
- ✅ Restart button
- ✅ Responsive trên mọi thiết bị

## 📄 License

MIT
