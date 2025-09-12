import { Check, X, Edit, Eye, Clock, MapPin, User, Phone, Coffee, Hash } from 'lucide-react';
import { getTimeSlotLabel, getStatusLabel, getStatusColor } from '../lib/utils';
import type { DailyMeeting } from '../types';

interface DailyMeetingCardProps {
  meeting: DailyMeeting;
  onView: (meeting: DailyMeeting) => void;
  onEdit: (meeting: DailyMeeting) => void;
  onApprove: (meeting: DailyMeeting) => void;
  onReject: (meeting: DailyMeeting) => void;
  canManage?: boolean;
}

export function DailyMeetingCard({ 
  meeting, 
  onView, 
  onEdit, 
  onApprove, 
  onReject,
  canManage = true
}: DailyMeetingCardProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-purple-100/50 p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-200">
      {/* Header: Time and Status */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-purple-600">
            <Clock className="w-5 h-5" />
            <span className="font-bold text-lg">{getTimeSlotLabel(meeting.timeSlot)}</span>
          </div>
          {meeting.capacity && (
            <span className="text-sm text-slate-500">
              (ความจุ {meeting.capacity} คน)
            </span>
          )}
        </div>
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(meeting.status)}`}>
          {getStatusLabel(meeting.status)}
        </span>
      </div>

      {/* Room and Meeting Title */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <MapPin className="w-4 h-4 text-slate-600" />
          <span className="font-semibold text-slate-800">{meeting.roomName}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">
          {meeting.meetingTitle}
        </h3>
      </div>

      {/* Booker Information */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <User className="w-4 h-4" />
          <span>{meeting.bookerName} {meeting.department && `(${meeting.department})`}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <Phone className="w-4 h-4" />
          <span>{meeting.phoneNumber}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <Hash className="w-4 h-4" />
          <span>{meeting.bookingCode}</span>
        </div>
      </div>

      {/* Break Request */}
      {meeting.needBreak && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2 text-orange-700">
            <Coffee className="w-4 h-4" />
            <span className="font-medium text-sm">
              ต้องการเบรค{meeting.breakOrganizer && ` (${meeting.breakOrganizer})`}
            </span>
          </div>
          {meeting.breakDetails && (
            <p className="text-sm text-orange-600 mt-1 ml-6">
              {meeting.breakDetails}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onView(meeting)}
          className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm"
          title="ดูรายละเอียด"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">ดูรายละเอียด</span>
        </button>

        {canManage && (
          <button
            onClick={() => onEdit(meeting)}
            className="flex items-center space-x-1 px-3 py-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors text-sm"
            title="แก้ไขข้อมูล"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">แก้ไข</span>
          </button>
        )}

        {canManage && meeting.status === 'pending' && (
          <>
            <button
              onClick={() => onApprove(meeting)}
              className="flex items-center space-x-1 px-3 py-2 bg-green-50 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors text-sm"
              title="อนุมัติ"
            >
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">อนุมัติ</span>
            </button>
            <button
              onClick={() => onReject(meeting)}
              className="flex items-center space-x-1 px-3 py-2 bg-red-50 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors text-sm"
              title="ปฏิเสธ"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">ปฏิเสธ</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}