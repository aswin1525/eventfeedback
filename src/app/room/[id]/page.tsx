"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { RoomConfig } from "@/types";

export default function RoomLanding({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [config, setConfig] = useState<RoomConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [roomId, setRoomId] = useState<string>("");

    useEffect(() => {
        params.then(p => {
            setRoomId(p.id);
            fetch(`/api/rooms/${p.id}/config`)
                .then((res) => {
                    if (!res.ok) throw new Error("Room not found");
                    return res.json();
                })
                .then((data) => setConfig(data))
                .catch(() => setError(true))
                .finally(() => setLoading(false));
        });
    }, [params]);

    const handleStart = () => {
        // Navigate to feedback flow
        // For now, we will keep the feedback flow in /feedback but it needs to be /room/[id]/feedback
        // OR we just keep query params? 
        // The previous implementation had /feedback/page.tsx using 'config'.
        // We should probably move /feedback to /room/[id]/feedback
        router.push(`/room/${roomId}/feedback`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-sympo-orange" />
            </div>
        );
    }

    if (error || !config) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4 text-center">
                <h1 className="text-3xl font-bold mb-4">Room Not Found</h1>
                <p className="text-white/60">The feedback room you are looking for does not exist or has been removed.</p>
                <Button onClick={() => router.push('/')} variant="ghost" className="mt-8">Go Home</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-sympo-orange/10 rounded-full blur-[120px] animate-blob" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-sympo-blue/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-2xl glass p-12 rounded-3xl border border-white/10 shadow-2xl">
                {/* Logo if exists */}
                {config.globalSettings.logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={config.globalSettings.logo} alt="Logo" className="w-24 h-24 object-contain mb-4" />
                )}

                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-sympo-orange via-white to-sympo-blue bg-clip-text text-transparent pb-2">
                        {config.globalSettings.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-white/80 font-light leading-relaxed">
                        {config.globalSettings.description}
                    </p>
                </div>

                <Button
                    size="lg"
                    onClick={handleStart}
                    className="text-lg px-12 py-8 rounded-2xl shadow-xl shadow-sympo-orange/20 hover:shadow-sympo-orange/40 transition-all duration-300 transform hover:scale-105"
                >
                    Start Feedback <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
            </div>

            <p className="absolute bottom-8 text-white/20 text-sm">Powered by SympoFeedback</p>
        </div>
    );
}
