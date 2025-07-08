# Meeting Room Frontend

## 🚀 Development Setup

### API Configuration

โปรเจคนี้ใช้ API URL ที่ต่างกันระหว่าง development และ production:

- **Development**: `/api` (proxy ไปที่ production API)
- **Production**: `https://cfw-bun-hono-drizzle.apiarm.workers.dev`

### Proxy Configuration

ใน `vite.config.ts` คุณสามารถเลือกใช้:

```typescript
// Option 1: ใช้ Production API (ไม่ต้องรัน backend locally)
target: 'https://cfw-bun-hono-drizzle.apiarm.workers.dev',

// Option 2: ใช้ Local Backend (ต้องรัน backend ที่ port 8787)
// target: 'http://localhost:8787',
```

### การรันโปรเจค

```bash
# Development (ใช้ production API)
npm run dev

# Build สำหรับ production
npm run build

# Preview build
npm run preview
```

### 🔧 Configuration Files

- `vite.config.ts`: ตั้งค่า proxy สำหรับ development
- `src/lib/api.ts`: API client ที่ auto-detect environment

### 📝 วิธีการ Deploy

1. Build project:
```bash
npm run build
```

2. Deploy ไฟล์ใน `dist/` folder

### 🌐 Environment Detection

- Development (`npm run dev`): `import.meta.env.DEV = true` → ใช้ `/api` (proxy)
- Production (`npm run build`): `import.meta.env.DEV = false` → ใช้ Cloudflare Workers URL

### 🛠️ Local Development with Backend

ถ้าต้องการใช้ local backend:

1. รัน backend server:
```bash
# ในโฟลเดอร์ backend
wrangler dev --port 8787
```

2. เปลี่ยน proxy target ใน `vite.config.ts`:
```typescript
target: 'http://localhost:8787',
```

3. รัน frontend:
```bash
npm run dev
```
