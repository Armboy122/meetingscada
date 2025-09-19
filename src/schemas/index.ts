import { z } from 'zod';

// Schema สำหรับ form input (needBreak เป็น string)
export const bookingFormInputSchema = z.object({
  bookerName: z
    .string()
    .min(1, 'กรุณากรอกชื่อผู้จอง')
    .min(2, 'ชื่อผู้จองต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อผู้จองต้องไม่เกิน 100 ตัวอักษร'),
  
  phoneNumber: z
    .string()
    .min(1, 'กรุณากรอกเบอร์โทรศัพท์')
    .regex(/^(?:[0-9]{5}|[0-9]{9,10})$/, 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 5 หลัก (ภายใน) หรือ 9-10 หลัก'),
  
  meetingTitle: z
    .string()
    .min(1, 'กรุณากรอกหัวข้อการประชุม')
    .min(3, 'หัวข้อการประชุมต้องมีอย่างน้อย 3 ตัวอักษร')
    .max(200, 'หัวข้อการประชุมต้องไม่เกิน 200 ตัวอักษร'),

  roomId: z
    .number({
      required_error: 'กรุณาเลือกห้องประชุม',
      invalid_type_error: 'ห้องประชุมต้องเป็นตัวเลข'
    })
    .min(1, 'กรุณาเลือกห้องประชุม'),

  timeSlot: z.enum(['morning', 'afternoon', 'full_day'], {
    required_error: 'กรุณาเลือกช่วงเวลา',
    invalid_type_error: 'ช่วงเวลาไม่ถูกต้อง'
  }),
  
  needBreak: z.string(),
  
  breakDetails: z
    .string()
    .max(500, 'รายละเอียดการพักต้องไม่เกิน 500 ตัวอักษร')
    .optional(),

  breakOrganizer: z
    .string()
    .max(50, 'หน่วยงานผู้จัดเบรคต้องไม่เกิน 50 ตัวอักษร')
    .optional(),

  department: z
    .string()
    .min(1, 'กรุณากรอกหน่วยงาน')
    .min(2, 'หน่วยงานต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'หน่วยงานต้องไม่เกิน 100 ตัวอักษร'),
  
  dates: z
    .array(z.string().min(1, 'วันที่ไม่ถูกต้อง'))
    .min(1, 'กรุณาเลือกวันที่อย่างน้อย 1 วัน')
    .max(30, 'สามารถจองได้สูงสุด 30 วัน')
}).refine((data) => {
  if (data.needBreak === 'true' && (!data.breakOrganizer || data.breakOrganizer.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "กรุณาเลือกหน่วยงานผู้จัดเบรค",
  path: ["breakOrganizer"]
});

// Schema สำหรับ processed data (needBreak เป็น boolean)
export const bookingSchema = z.object({
  bookerName: z
    .string()
    .min(1, 'กรุณากรอกชื่อผู้จอง')
    .min(2, 'ชื่อผู้จองต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อผู้จองต้องไม่เกิน 100 ตัวอักษร'),
  
  phoneNumber: z
    .string()
    .min(1, 'กรุณากรอกเบอร์โทรศัพท์')
    .regex(/^[0-9]{9,10}$/, 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก'),
  
  meetingTitle: z
    .string()
    .min(1, 'กรุณากรอกหัวข้อการประชุม')
    .min(3, 'หัวข้อการประชุมต้องมีอย่างน้อย 3 ตัวอักษร')
    .max(200, 'หัวข้อการประชุมต้องไม่เกิน 200 ตัวอักษร'),

  roomId: z
    .number({
      required_error: 'กรุณาเลือกห้องประชุม',
      invalid_type_error: 'ห้องประชุมต้องเป็นตัวเลข'
    })
    .min(1, 'กรุณาเลือกห้องประชุม'),

  timeSlot: z.enum(['morning', 'afternoon', 'full_day'], {
    required_error: 'กรุณาเลือกช่วงเวลา',
    invalid_type_error: 'ช่วงเวลาไม่ถูกต้อง'
  }),
  
  needBreak: z.boolean(),
  
  breakDetails: z
    .string()
    .max(500, 'รายละเอียดการพักต้องไม่เกิน 500 ตัวอักษร')
    .optional(),

  breakOrganizer: z
    .string()
    .max(50, 'หน่วยงานผู้จัดเบรคต้องไม่เกิน 50 ตัวอักษร')
    .optional(),

  department: z
    .string()
    .min(1, 'กรุณากรอกหน่วยงาน')
    .min(2, 'หน่วยงานต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'หน่วยงานต้องไม่เกิน 100 ตัวอักษร'),
  
  dates: z
    .array(z.string().min(1, 'วันที่ไม่ถูกต้อง'))
    .min(1, 'กรุณาเลือกวันที่อย่างน้อย 1 วัน')
    .max(30, 'สามารถจองได้สูงสุด 30 วัน')
});

// Schema สำหรับการเข้าสู่ระบบ Admin
export const adminLoginSchema = z.object({
  username: z
    .string()
    .min(1, 'กรุณากรอกชื่อผู้ใช้')
    .min(3, 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร')
    .max(50, 'ชื่อผู้ใช้ต้องไม่เกิน 50 ตัวอักษร')
    .regex(/^[a-zA-Z0-9_]+$/, 'ชื่อผู้ใช้ต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _ เท่านั้น'),
  
  password: z
    .string()
    .min(1, 'กรุณากรอกรหัสผ่าน')
    .min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
    .max(100, 'รหัสผ่านต้องไม่เกิน 100 ตัวอักษร'),
    
  rememberMe: z.boolean()
});

// Schema สำหรับการเปลี่ยนรหัสผ่าน
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'กรุณากรอกรหัสผ่านปัจจุบัน'),
  
  newPassword: z
    .string()
    .min(1, 'กรุณากรอกรหัสผ่านใหม่')
    .min(6, 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร')
    .max(100, 'รหัสผ่านใหม่ต้องไม่เกิน 100 ตัวอักษร'),
  
  confirmPassword: z
    .string()
    .min(1, 'กรุณายืนยันรหัสผ่านใหม่')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"]
});

// Schema สำหรับการจัดการห้องประชุม
export const roomSchema = z.object({
  roomName: z
    .string()
    .min(1, 'กรุณากรอกชื่อห้องประชุม')
    .min(2, 'ชื่อห้องประชุมต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อห้องประชุมต้องไม่เกิน 100 ตัวอักษร'),
  
  capacity: z
    .number({
      required_error: 'กรุณากรอกจำนวนที่นั่ง',
      invalid_type_error: 'จำนวนที่นั่งต้องเป็นตัวเลข'
    })
    .min(1, 'จำนวนที่นั่งต้องมีอย่างน้อย 1 ที่นั่ง')
    .max(1000, 'จำนวนที่นั่งต้องไม่เกิน 1000 ที่นั่ง'),
  
  description: z
    .string()
    .max(500, 'รายละเอียดต้องไม่เกิน 500 ตัวอักษร')
    .optional()
});

// Schema สำหรับการจัดการแอดมิน
export const adminSchema = z.object({
  fullName: z
    .string()
    .min(1, 'กรุณากรอกชื่อเต็ม')
    .min(2, 'ชื่อเต็มต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อเต็มต้องไม่เกิน 100 ตัวอักษร'),
  
  username: z
    .string()
    .min(1, 'กรุณากรอกชื่อผู้ใช้')
    .min(3, 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร')
    .max(50, 'ชื่อผู้ใช้ต้องไม่เกิน 50 ตัวอักษร')
    .regex(/^[a-zA-Z0-9_]+$/, 'ชื่อผู้ใช้ต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _ เท่านั้น'),
  
  email: z
    .string()
    .email('รูปแบบอีเมลไม่ถูกต้อง')
    .max(100, 'อีเมลต้องไม่เกิน 100 ตัวอักษร')
    .optional(),
  
  password: z
    .string()
    .min(1, 'กรุณากรอกรหัสผ่าน')
    .min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
    .max(100, 'รหัสผ่านต้องไม่เกิน 100 ตัวอักษร'),

  confirmPassword: z
    .string()
    .min(1, 'กรุณายืนยันรหัสผ่าน'),

  isActive: z.boolean().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"]
});

// Schema สำหรับการอัปเดตแอดมิน (ไม่ต้องมี password)
export const adminUpdateSchema = z.object({
  fullName: z
    .string()
    .min(1, 'กรุณากรอกชื่อเต็ม')
    .min(2, 'ชื่อเต็มต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อเต็มต้องไม่เกิน 100 ตัวอักษร'),
  
  username: z
    .string()
    .min(1, 'กรุณากรอกชื่อผู้ใช้')
    .min(3, 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร')
    .max(50, 'ชื่อผู้ใช้ต้องไม่เกิน 50 ตัวอักษร')
    .regex(/^[a-zA-Z0-9_]+$/, 'ชื่อผู้ใช้ต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _ เท่านั้น'),
  
  email: z
    .string()
    .email('รูปแบบอีเมลไม่ถูกต้อง')
    .max(100, 'อีเมลต้องไม่เกิน 100 ตัวอักษร')
    .optional(),

  isActive: z.boolean().optional()
});

// Schema สำหรับการอนุมัติ/ปฏิเสธการจอง
export const approvalSchema = z.object({
  adminId: z
    .number({
      required_error: 'ต้องระบุ Admin ID',
      invalid_type_error: 'Admin ID ต้องเป็นตัวเลข'
    })
    .min(1, 'Admin ID ต้องมากกว่า 0'),
  
  reason: z
    .string()
    .max(500, 'เหตุผลต้องไม่เกิน 500 ตัวอักษร')
    .optional()
});

// Types ที่ infer จาก schemas
export type BookingFormInputData = z.infer<typeof bookingFormInputSchema>;
export type BookingFormData = z.infer<typeof bookingSchema>;
export type AdminLoginData = z.infer<typeof adminLoginSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type RoomFormData = z.infer<typeof roomSchema>;
export type AdminFormData = z.infer<typeof adminSchema>;
export type AdminUpdateData = z.infer<typeof adminUpdateSchema>;
export type ApprovalData = z.infer<typeof approvalSchema>;