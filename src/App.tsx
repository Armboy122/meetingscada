import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useRooms } from './hooks/useRooms';
import { useBookings } from './hooks/useBookings';
import { useAuth } from './contexts/AuthContext';
import { Calendar } from './components/Calendar';
import { RoomTabs } from './components/RoomTabs';
import { BookingModal } from './components/BookingModal';
import { BookingForm } from './components/BookingForm';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import type { Booking } from './types';

function App() {
  const { data: rooms = [] } = useRooms();
  const { data: allBookings = [] } = useBookings({}); // ดึงข้อมูลทั้งหมดสำหรับ count pending
  const { isAuthenticated, loading, logout } = useAuth();
  const [selectedRoomId, setSelectedRoomId] = useState<number>(1);
  
  useEffect(() => {
    if (rooms.length > 0 && selectedRoomId === 1) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsBookingFormOpen(true);
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = () => {
    setIsBookingFormOpen(false);
    setSelectedDate(null);
  };

  const handleAdminLoginSuccess = () => {
    // ไม่ต้องทำอะไร เพราะ AuthContext จัดการให้แล้ว
  };

  const handleAdminLogout = () => {
    logout();
    setShowAdmin(false);
  };

  // แสดง loading ระหว่างตรวจสอบ authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-50 to-violet-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100/50 p-8">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
            <span className="text-lg text-slate-600">กำลังโหลดระบบ...</span>
          </div>
        </div>
      </div>
    );
  }

  if (showAdmin && !isAuthenticated) {
    return (
      <AdminLogin
        onSuccess={handleAdminLoginSuccess}
        onBack={() => setShowAdmin(false)}
      />
    );
  }

  if (showAdmin && isAuthenticated) {
    return <AdminDashboard onBack={handleAdminLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-50 to-violet-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-slate-800">
                ระบบจองห้องประชุม
              </h1>
              <p className="text-slate-500 text-sm">
                เลือกห้องและวันที่ต้องการใช้งาน
              </p>
            </div>
            <button
              onClick={() => setShowAdmin(true)}
              className="relative flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-400 to-violet-400 text-white rounded-xl hover:from-purple-500 hover:to-violet-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Settings className="w-4 h-4" />
              <span className="font-medium">สำหรับแอดมิน</span>
              {allBookings.filter(b => b.status === 'pending').length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse border-2 border-white shadow-lg">
                  {allBookings.filter(b => b.status === 'pending').length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <RoomTabs
            selectedRoomId={selectedRoomId}
            onRoomSelect={setSelectedRoomId}
          />
        </div>

        <Calendar
          selectedRoomId={selectedRoomId}
          onDateClick={handleDateClick}
          onBookingClick={handleBookingClick}
        />

        <BookingModal
          booking={selectedBooking}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedBooking(null);
          }}
        />

        <BookingForm
          selectedDate={selectedDate}
          selectedRoomId={selectedRoomId}
          isOpen={isBookingFormOpen}
          onClose={() => {
            setIsBookingFormOpen(false);
            setSelectedDate(null);
          }}
          onSuccess={handleBookingSuccess}
        />
      </div>
    </div>
  );
}

export default App;
