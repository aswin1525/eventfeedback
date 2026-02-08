"use client";

import { Button } from "@/components/ui/button";
import { Plus, LayoutDashboard, ArrowRight, Loader2, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RoomMetadata } from "@/types";
import { useRouter } from "next/navigation";

export default function CreatorDashboard() {
  const [rooms, setRooms] = useState<RoomMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /* import { RefreshCcw } from "lucide-react"; provided in context, ensure it's imported at top */

  const fetchRooms = () => {
    setLoading(true);
    fetch('/api/rooms', { cache: 'no-store' }) // Ensure fresh data
      .then(res => res.json())
      .then(data => setRooms(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const createNewRoom = async () => {
    router.push('/create');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-12 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sympo-orange to-sympo-blue bg-clip-text text-transparent">
            SympoCreator
          </h1>
          <p className="text-white/60">Manage your feedback rooms</p>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={fetchRooms} disabled={loading}>
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" onClick={() => {
            document.cookie = 'admin_user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            document.cookie = 'admin_auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            router.push('/admin/login');
          }}>
            Logout
          </Button>
          <Button onClick={createNewRoom}>
            <Plus className="w-4 h-4 mr-2" />
            Create Room
          </Button>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-sympo-orange" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="glass p-20 rounded-3xl text-center space-y-6">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <LayoutDashboard className="w-10 h-10 text-white/20" />
            </div>
            <h2 className="text-2xl font-bold text-white">No Rooms Yet</h2>
            <p className="text-white/60 max-w-md mx-auto">
              Create your first feedback room to start collecting insights from your events.
            </p>
            <Button size="lg" onClick={createNewRoom} className="mt-4">
              Create Your First Room
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Card */}
            <div
              onClick={createNewRoom}
              className="glass p-8 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-all border-dashed border-2 border-white/10 hover:border-sympo-orange/50 group h-[200px]"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-white/60" />
              </div>
              <span className="font-semibold text-white/60 group-hover:text-white">Create New Room</span>
            </div>

            {rooms.map(room => (
              <Link href={`/room/${room.id}/analysis`} key={room.id}>
                <div className="glass p-8 rounded-2xl h-[200px] flex flex-col justify-between hover:scale-[1.02] transition-transform hover:shadow-xl hover:shadow-sympo-blue/10 border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-white/40" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{room.name}</h3>
                    <p className="text-xs text-white/40">Created {new Date(room.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-sympo-blue">
                      {room.eventCount} Events
                    </span>
                    <span className="bg-green-500/10 px-3 py-1 rounded-full text-xs font-medium text-green-400">
                      Active
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
