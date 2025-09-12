# CLAUDE.md

ไฟล์นี้ให้คำแนะนำสำหรับ Claude Code (claude.ai/code) เมื่อทำงานกับโค้ดในโปรเจคนี้

## ภาพรวมโปรเจค

นี่คือระบบจองห้องประชุมแบบ frontend ที่สร้างด้วย React, TypeScript และ Vite ระบบให้ผู้ใช้จองห้องประชุมและมีหน้าแอดมินสำหรับการจัดการ

## คำสั่งพัฒนา

```bash
# เริ่มเซิร์ฟเวอร์พัฒนา
npm run dev

# สร้างสำหรับ production
npm run build

# เรียกใช้ ESLint
npm run lint

# ดูตัวอย่าง production build
npm run preview
```

## สถาปัตยกรรม

### การตั้งค่า API
แอปใช้การตั้งค่า API แบบตรวจสอบ environment:
- **Development**: `/api` (proxy ผ่าน Vite ไปยัง production API)
- **Production**: `https://cfw-bun-hono-drizzle.apiarm.workers.dev`

การตั้งค่าอยู่ใน `vite.config.ts` และสามารถสลับระหว่าง local backend (`http://localhost:8787`) และ production API ได้

### รูปแบบสถาปัตยกรรมหลัก

1. **การดึงข้อมูล**: ใช้ TanStack Query สำหรับการจัดการ server state
2. **ฟอร์ม**: React Hook Form พร้อม Zod validation
3. **การนำทาง**: TanStack Router สำหรับ type-safe routing
4. **State**: React Context สำหรับ authentication, React Query สำหรับ server state
5. **การจัดแต่ง**: Tailwind CSS พร้อมชุดสีกำหนดเอง

### ไดเรกทอรี่สำคัญ

- `src/hooks/`: Custom hooks สำหรับการดำเนินการ API (useRooms, useBookings, useAdmins, useHistory)
- `src/components/`: React components จัดกลุ่มตามฟีเจอร์
- `src/contexts/`: React contexts (AuthContext)
- `src/lib/api.ts`: API client หลักพร้อมการจัดการ error และ retries
- `src/types/`: นิยาม TypeScript types

### การทำงานของ Authentication

แอปมี 2 โหมด:
1. **Public**: หน้าจองห้องสำหรับผู้ใช้ทั่วไป
2. **Admin**: Dashboard ที่ป้องกันต้องเข้าสู่ระบบ

Authentication จัดการผ่าน JWT tokens เก็บใน localStorage โดย `AuthContext`

### สถาปัตยกรรม Component

- `App.tsx`: Router หลักจัดการมุมมอง public/admin
- `Calendar.tsx`: หน้าปฏิทินหลักสำหรับจองห้อง
- `AdminDashboard.tsx`: หน้าแอดมินสำหรับจัดการการจองและห้อง
- `BookingForm.tsx`: ฟอร์มสำหรับสร้างการจองใหม่
- `AdminLogin.tsx`: หน้าเข้าสู่ระบบสำหรับแอดมิน

### การรวม API

คลาส `APIClient` ใน `src/lib/api.ts` ให้:
- การจัดการ token อัตโนมัติ
- การลองใหม่ด้วย exponential backoff
- การสลับ base URL ตาม environment
- การจัดการ error แบบสม่ำเสมอ

### การตั้งค่า Proxy

ในการพัฒนา การเรียก API ไป `/api` จะถูก proxy ผ่าน Vite ไปยัง production Cloudflare Workers API เพื่อใช้ local backend:

1. เปลี่ยน proxy target ใน `vite.config.ts` เป็น `http://localhost:8787`
2. เริ่ม backend ด้วย `wrangler dev --port 8787`