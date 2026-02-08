"use client";

import { Button } from "@/components/ui/button";
import { EVENTS } from "@/lib/constants";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

// Mock Data Analysis
const MOCK_STATS = {
    totalSubmissions: 124,
    averageRating: 4.2,
    eventBreakdown: [
        { name: "Inauguration", rating: 4.5, count: 120 },
        { name: "Paper Pres", rating: 3.8, count: 85 },
        { name: "Tech Quiz", rating: 4.1, count: 90 },
        { name: "Workshop", rating: 4.7, count: 60 },
        { name: "Valedictory", rating: 4.0, count: 110 },
    ],
};

const COLORS = ["#f97316", "#3b82f6", "#22c55e", "#eab308", "#ef4444"];

export default function AdminDashboard() {
    const router = useRouter();

    const handleLogout = () => {
        document.cookie = "admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        router.push("/admin/login");
    };

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-8">
            {/* Background Blobs (Fixed) */}
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-sympo-orange/5 rounded-full blur-[100px] -z-10" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-sympo-blue/5 rounded-full blur-[100px] -z-10" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 glass p-6 rounded-2xl">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-white/60">Real-time feedback analysis</p>
                </div>
                <Button variant="ghost" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 flex flex-col items-center justify-center space-y-2">
                    <span className="text-4xl font-bold text-sympo-orange">{MOCK_STATS.totalSubmissions}</span>
                    <span className="text-white/60">Total Responses</span>
                </div>
                <div className="glass-card p-6 flex flex-col items-center justify-center space-y-2">
                    <span className="text-4xl font-bold text-sympo-blue">{MOCK_STATS.averageRating}</span>
                    <span className="text-white/60">Overall Rating</span>
                </div>
                <div className="glass-card p-6 flex flex-col items-center justify-center space-y-2">
                    <span className="text-4xl font-bold text-green-400">{EVENTS.length}</span>
                    <span className="text-white/60">Active Events</span>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Rating Bar Chart */}
                <div className="glass-card p-6 h-[400px]">
                    <h3 className="text-xl font-bold text-white mb-6">Event Ratings</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={MOCK_STATS.eventBreakdown}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="#ffffff60" fontSize={12} />
                            <YAxis stroke="#ffffff60" domain={[0, 5]} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="rating" fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Participation Pie Chart */}
                <div className="glass-card p-6 h-[400px]">
                    <h3 className="text-xl font-bold text-white mb-6">Participation Distribution</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                            <Pie
                                data={MOCK_STATS.eventBreakdown}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="count"
                            >
                                {MOCK_STATS.eventBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
