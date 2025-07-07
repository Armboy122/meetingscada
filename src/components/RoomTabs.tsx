import { useRooms } from '../hooks/useRooms';
import { cn } from '../lib/utils';

interface RoomTabsProps {
  selectedRoomId: number;
  onRoomSelect: (roomId: number) => void;
}

export function RoomTabs({ selectedRoomId, onRoomSelect }: RoomTabsProps) {
  const { data: rooms = [], isLoading } = useRooms();

  if (isLoading) {
    return (
      <div className="flex space-x-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-purple-100 rounded-2xl animate-pulse w-36"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex space-x-3 overflow-x-auto pb-2">
      {rooms.map(room => (
        <button
          key={room.id}
          onClick={() => onRoomSelect(room.id)}
          className={cn(
            'px-6 py-4 rounded-2xl font-medium whitespace-nowrap transition-all duration-200 min-w-fit shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 touch-manipulation',
            selectedRoomId === room.id
              ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-2xl border-2 border-purple-400'
              : 'bg-white text-slate-800 hover:bg-purple-50 border-2 border-purple-300 hover:border-purple-400'
          )}
        >
          <div className="text-sm font-black">{room.roomName}</div>
          <div className={cn(
            "text-xs mt-1 font-bold",
            selectedRoomId === room.id ? 'text-purple-100' : 'text-slate-600'
          )}>
            👥 {room.capacity} ที่นั่ง
          </div>
        </button>
      ))}
    </div>
  );
}