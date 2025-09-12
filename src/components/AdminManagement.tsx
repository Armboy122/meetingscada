import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit, Trash2, Users, X, Mail, User, Key, Eye } from 'lucide-react';
import { useAdmins, useCreateAdmin, useUpdateAdmin, useDeleteAdmin } from '../hooks/useAdmins';
import { adminSchema, adminUpdateSchema, type AdminFormData, type AdminUpdateData } from '../schemas';
import { formatDate } from '../lib/utils';
import type { Admin } from '../types';

export function AdminManagement() {
  const { data: admins = [], isLoading, refetch } = useAdmins();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const createAdmin = useCreateAdmin();
  const updateAdmin = useUpdateAdmin();
  const deleteAdmin = useDeleteAdmin();

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    watch: watchCreate,
    formState: { errors: errorsCreate }
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema)
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setValueEdit,
    formState: { errors: errorsEdit }
  } = useForm<AdminUpdateData>({
    resolver: zodResolver(adminUpdateSchema)
  });

  const handleCreateAdmin = async (data: AdminFormData) => {
    try {
      // ตรวจสอบรหัสผ่าน
      if (!data.password) {
        console.error('Password is required');
        return;
      }
      
      // ส่งรหัสผ่าน plain text ไป Backend จะเป็นคน hash
      const adminData = {
        username: data.username,
        fullName: data.fullName,
        email: data.email || '',
        password: data.password // ส่ง plain text password
      };
      await createAdmin.mutateAsync(adminData);
      setShowCreateModal(false);
      resetCreate();
      refetch();
    } catch (error) {
      console.error('Error creating admin:', error);
    }
  };

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setValueEdit('username', admin.username);
    setValueEdit('fullName', admin.fullName);
    setValueEdit('email', admin.email || '');
    setValueEdit('isActive', admin.isActive);
    setShowEditModal(true);
  };

  const handleUpdateAdmin = async (data: AdminUpdateData) => {
    if (!selectedAdmin) return;
    
    try {
      await updateAdmin.mutateAsync({
        id: selectedAdmin.id,
        data: {
          username: data.username,
          fullName: data.fullName,
          email: data.email || '',
          isActive: data.isActive ?? true
        }
      });
      setShowEditModal(false);
      setSelectedAdmin(null);
      resetEdit();
      refetch();
    } catch (error) {
      console.error('Error updating admin:', error);
    }
  };

  const handleDeleteAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAdmin) return;
    
    try {
      await deleteAdmin.mutateAsync(selectedAdmin.id);
      setShowDeleteModal(false);
      setSelectedAdmin(null);
      refetch();
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100/50 p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-slate-600">กำลังโหลดข้อมูลผู้ดูแลระบบ...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100/50 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">จัดการผู้ดูแลระบบ</h2>
              <p className="text-sm text-slate-600">เพิ่ม แก้ไข และจัดการบัญชีผู้ดูแลระบบ</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">เพิ่มผู้ดูแลใหม่</span>
          </button>
        </div>
      </div>

      {/* Admins List */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100/50 overflow-hidden">
        {/* Desktop Table View */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ผู้ใช้
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ข้อมูลติดต่อ
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  วันที่สร้าง
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map(admin => (
                <tr key={admin.id} className="hover:bg-blue-25 transition-colors duration-200">
                  {/* ผู้ใช้ */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{admin.fullName}</div>
                        <div className="text-sm text-slate-600">@{admin.username}</div>
                      </div>
                    </div>
                  </td>
                  
                  {/* ข้อมูลติดต่อ */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4" />
                      <span>{admin.email || 'ไม่ระบุ'}</span>
                    </div>
                  </td>
                  
                  {/* สถานะ */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      admin.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.isActive ? 'ใช้งานได้' : 'ปิดใช้งาน'}
                    </span>
                  </td>
                  
                  {/* วันที่สร้าง */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {formatDate(admin.createdAt)}
                  </td>
                  
                  {/* จัดการ */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditAdmin(admin)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="แก้ไข"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(admin)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {admins.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">ยังไม่มีผู้ดูแลระบบ</p>
              <p className="text-slate-400 text-sm">คลิกปุ่ม "เพิ่มผู้ดูแลใหม่" เพื่อเริ่มต้น</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-100/50 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">เพิ่มผู้ดูแลระบบใหม่</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitCreate(handleCreateAdmin)} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  ชื่อผู้ใช้ *
                </label>
                <input
                  type="text"
                  {...registerCreate('username', { 
                    required: 'กรุณากรอกชื่อผู้ใช้',
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษร ตัวเลข และ _'
                    }
                  })}
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80"
                  placeholder="เช่น admin01"
                />
                {errorsCreate.username && (
                  <p className="mt-1 text-sm text-red-600">{errorsCreate.username.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  ชื่อเต็ม *
                </label>
                <input
                  type="text"
                  {...registerCreate('fullName', { required: 'กรุณากรอกชื่อเต็ม' })}
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80"
                  placeholder="เช่น นายสมชาย ผู้ดูแล"
                />
                {errorsCreate.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errorsCreate.fullName.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  อีเมล
                </label>
                <input
                  type="email"
                  {...registerCreate('email')}
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80"
                  placeholder="เช่น admin@example.com"
                />
                {errorsCreate.email && (
                  <p className="mt-1 text-sm text-red-600">{errorsCreate.email.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  รหัสผ่าน *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...registerCreate('password', { 
                      required: 'กรุณากรอกรหัสผ่าน',
                      minLength: {
                        value: 6,
                        message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
                      }
                    })}
                    className="w-full px-4 py-3 pr-12 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80"
                    placeholder="กรอกรหัสผ่าน"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600"
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <Key className="w-5 h-5" />}
                  </button>
                </div>
                {errorsCreate.password && (
                  <p className="mt-1 text-sm text-red-600">{errorsCreate.password.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  ยืนยันรหัสผ่าน *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...registerCreate('confirmPassword', { 
                      required: 'กรุณายืนยันรหัสผ่าน',
                      validate: (value) => {
                        const passwordValue = watchCreate('password');
                        return value === passwordValue || 'รหัสผ่านไม่ตรงกัน';
                      }
                    })}
                    className="w-full px-4 py-3 pr-12 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80"
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600"
                  >
                    {showConfirmPassword ? <Eye className="w-5 h-5" /> : <Key className="w-5 h-5" />}
                  </button>
                </div>
                {errorsCreate.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errorsCreate.confirmPassword.message}</p>
                )}
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={createAdmin.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  {createAdmin.isPending ? 'กำลังสร้าง...' : 'สร้างบัญชี'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-100/50 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">แก้ไขผู้ดูแลระบบ</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitEdit(handleUpdateAdmin)} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  ชื่อผู้ใช้ *
                </label>
                <input
                  type="text"
                  {...registerEdit('username', { 
                    required: 'กรุณากรอกชื่อผู้ใช้',
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษร ตัวเลข และ _'
                    }
                  })}
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80"
                  placeholder="เช่น admin01"
                />
                {errorsEdit.username && (
                  <p className="mt-1 text-sm text-red-600">{errorsEdit.username.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  ชื่อเต็ม *
                </label>
                <input
                  type="text"
                  {...registerEdit('fullName', { required: 'กรุณากรอกชื่อเต็ม' })}
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80"
                  placeholder="เช่น นายสมชาย ผู้ดูแล"
                />
                {errorsEdit.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errorsEdit.fullName.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  อีเมล
                </label>
                <input
                  type="email"
                  {...registerEdit('email')}
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80"
                  placeholder="เช่น admin@example.com"
                />
                {errorsEdit.email && (
                  <p className="mt-1 text-sm text-red-600">{errorsEdit.email.message}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  {...registerEdit('isActive')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  เปิดใช้งานบัญชี
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={updateAdmin.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  {updateAdmin.isPending ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Admin Modal */}
      {showDeleteModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-100/50 p-6 w-full max-w-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ยืนยันการลบผู้ดูแลระบบ
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                คุณแน่ใจหรือไม่ที่จะลบบัญชีผู้ดูแล <strong>"{selectedAdmin.username}"</strong>?<br/>
                การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteAdmin.isPending}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all duration-200 font-medium disabled:opacity-50"
              >
                {deleteAdmin.isPending ? 'กำลังลบ...' : 'ลบบัญชี'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 