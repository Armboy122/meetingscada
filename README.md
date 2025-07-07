# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

# Meeting Room Frontend

## 🚀 Development Setup

### API Configuration

โปรเจคนี้ใช้ API URL ที่ต่างกันระหว่าง development และ production:

- **Development**: `/api` (proxy ไปที่ `localhost:8787`)
- **Production**: `https://your-app.workers.dev`

### Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `meeting-room-frontend/`:

```bash
# Development (ใช้ proxy)
VITE_API_BASE_URL=/api

# Production (ใช้ Cloudflare Workers URL จริง)
# VITE_API_BASE_URL=https://your-app.workers.dev
```

### การรันโปรเจค

```bash
# Development
npm run dev

# Build สำหรับ production
npm run build

# Preview build
npm run preview
```

### 🔧 Configuration Files

- `vite.config.ts`: ตั้งค่า proxy สำหรับ development
- `src/lib/api.ts`: API client ที่ใช้ environment variables

### 📝 วิธีการ Deploy

1. แก้ไข URL ใน `vite.config.ts`:
```typescript
define: {
  __API_BASE_URL__: JSON.stringify(
    mode === 'development' ? '/api' : 'https://your-actual-workers-url.workers.dev'
  ),
},
```

2. Build project:
```bash
npm run build
```

3. Deploy ไฟล์ใน `dist/` folder
