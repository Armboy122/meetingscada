import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit, Trash2, Users, X, Building } from 'lucide-react';
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from '../hooks/useRooms';
import { roomSchema, type RoomFormData } from '../schemas';
import { formatDate } from '../lib/utils';
import type { MeetingRoom } from '../types';

export function RoomManagement() {
  const { data: rooms = [], isLoading, refetch } = useRooms();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null);
  
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: errorsCreate }
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema)
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setValueEdit,
    formState: { errors: errorsEdit }
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema)
  });

  const handleCreateRoom = async (data: RoomFormData) => {
    try {
      await createRoom.mutateAsync(data);
      setShowCreateModal(false);
      resetCreate();
      refetch();
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleEditRoom = (room: MeetingRoom) => {
    setSelectedRoom(room);
    setValueEdit('roomName', room.roomName);
    setValueEdit('capacity', room.capacity);
    setShowEditModal(true);
  };

  const handleUpdateRoom = async (data: RoomFormData) => {
    if (!selectedRoom) return;
    
    try {
      await updateRoom.mutateAsync({
        id: selectedRoom.id,
        data: { ...data, isActive: selectedRoom.isActive }
      });
      setShowEditModal(false);
      setSelectedRoom(null);
      resetEdit();
      refetch();
    } catch (error) {
      console.error('Error updating room:', error);
    }
  };

  const handleDeleteRoom = (room: MeetingRoom) => {
    setSelectedRoom(room);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRoom) return;
    
    try {
      await deleteRoom.mutateAsync(selectedRoom.id);
      setShowDeleteModal(false);
      setSelectedRoom(null);
      refetch();
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100/50 p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-slate-600">กำลังโหลดข้อมูลห้องประชุม...</div>
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
            <div className="p-3 bg-gradient-to-r from-purple-100 to-violet-100 rounded-xl">
              <Building className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">จัดการห้องประชุม</h2>
              <p className="text-sm text-slate-600">เพิ่ม แก้ไข และจัดการห้องประชุมทั้งหมด</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl hover:from-purple-600 hover:to-violet-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">เพิ่มห้องใหม่</span>
          </button>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <div
            key={room.id}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100/50 p-6 hover:shadow-2xl transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg">
                  <Building className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{room.roomName}</h3>
                  <div className="flex items-center space-x-1 text-sm text-slate-600">
                    <Users className="w-4 h-4" />
                    <span>{room.capacity} ที่นั่ง</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditRoom(room)}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="แก้ไข"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRoom(room)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="ลบ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">สถานะ:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  room.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {room.isActive ? 'ใช้งานได้' : 'ปิดใช้งาน'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">สร้างเมื่อ:</span>
                <span className="text-slate-800">
                  {formatDate(room.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {rooms.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Building className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">ยังไม่มีห้องประชุม</p>
            <p className="text-slate-400 text-sm">คลิกปุ่ม "เพิ่มห้องใหม่" เพื่อเริ่มต้น</p>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-100/50 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">เพิ่มห้องประชุมใหม่</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitCreate(handleCreateRoom)} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  ชื่อห้องประชุม *
                </label>
                <input
                  type="text"
                  {...registerCreate('roomName', { required: 'กรุณากรอกชื่อห้องประชุม' })}
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80"
                  placeholder="เช่น ห้องประชุมใหญ่"
                />
                {errorsCreate.roomName && (
                  <p className="mt-1 text-sm text-red-600">{errorsCreate.roomName.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  ความจุ (จำนวนที่นั่ง) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  {...registerCreate('capacity', { 
                    required: 'กรุณากรอกความจุห้อง',
                    min: { value: 1, message: 'ความจุต้องมากกว่า 0' },
                    max: { value: 200, message: 'ความจุไม่เกิน 200 ที่นั่ง' },
                    valueAsNumber: true
                  })}
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80"
                  placeholder="เช่น 20"
                />
                {errorsCreate.capacity && (
                  <p className="mt-1 text-sm text-red-600">{errorsCreate.capacity.message}</p>
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
                  disabled={createRoom.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl hover:from-purple-600 hover:to-violet-600 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  {createRoom.isPending ? 'กำลังสร้าง...' : 'สร้างห้อง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-100/50 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">แก้ไขห้องประชุม</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitEdit(handleUpdateRoom)} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  ชื่อห้องประชุม *
                </label>
                <input
                  type="text"
                  {...registerEdit('roomName', { required: 'กรุณากรอกชื่อห้องประชุม' })}
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80"
                  placeholder="เช่น ห้องประชุมใหญ่"
                />
                {errorsEdit.roomName && (
                  <p className="mt-1 text-sm text-red-600">{errorsEdit.roomName.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  ความจุ (จำนวนที่นั่ง) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  {...registerEdit('capacity', { 
                    required: 'กรุณากรอกความจุห้อง',
                    min: { value: 1, message: 'ความจุต้องมากกว่า 0' },
                    max: { value: 200, message: 'ความจุไม่เกิน 200 ที่นั่ง' },
                    valueAsNumber: true
                  })}
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80"
                  placeholder="เช่น 20"
                />
                {errorsEdit.capacity && (
                  <p className="mt-1 text-sm text-red-600">{errorsEdit.capacity.message}</p>
                )}
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
                  disabled={updateRoom.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  {updateRoom.isPending ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Room Modal */}
      {showDeleteModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-100/50 p-6 w-full max-w-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ยืนยันการลบห้องประชุม
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                คุณแน่ใจหรือไม่ที่จะลบห้องประชุม <strong>"{selectedRoom.roomName}"</strong>?<br/>
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
                disabled={deleteRoom.isPending}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all duration-200 font-medium disabled:opacity-50"
              >
                {deleteRoom.isPending ? 'กำลังลบ...' : 'ลบห้องประชุม'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 