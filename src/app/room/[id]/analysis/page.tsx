"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RoomConfig } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Copy, LayoutDashboard, Loader2, RefreshCcw, Search, Download, Plus, Pencil, Trash2, Check, X, Star, Type, List, Smile, Settings, Calendar, BarChart3, HelpCircle, Home } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
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
    Cell
} from "recharts";

interface RoomStats {
    summary: {
        totalSubmissions: number;
        averageRating: number;
    };
    events: {
        name: string;
        count: number;
        rating: number;
    }[];
}

const COLORS = ["#f97316", "#3b82f6", "#22c55e", "#eab308", "#ef4444", "#8b5cf6"];

export default function RoomAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [config, setConfig] = useState<RoomConfig | null>(null);
    const [stats, setStats] = useState<RoomStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Feedback Table State
    const [feedbackRows, setFeedbackRows] = useState<string[][]>([]);
    const [feedbackSearch, setFeedbackSearch] = useState("");

    // Management State
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedEventId, setSelectedEventId] = useState("");

    // UI Interaction State (No Alerts)
    const [newEventTitle, setNewEventTitle] = useState("");
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [editEventTitle, setEditEventTitle] = useState("");
    const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

    const [newQuestionLabel, setNewQuestionLabel] = useState("");
    const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError("");

        try {
            // Fetch Config
            const configRes = await fetch(`/api/rooms/${id}/config?t=${Date.now()}`);
            if (!configRes.ok) throw new Error("Failed to load room config");
            const configData = await configRes.json();
            setConfig(configData);

            // Fetch Stats
            const statsRes = await fetch(`/api/rooms/${id}/stats?t=${Date.now()}`);
            if (!statsRes.ok) throw new Error("Failed to load room stats");
            const statsData = await statsRes.json();
            setStats(statsData);

            // Fetch Raw Feedback (now using room-specific local API)
            const feedbackRes = await fetch(`/api/rooms/${id}/feedback?t=${Date.now()}`);
            if (feedbackRes.ok) {
                const feedbackData = await feedbackRes.json();
                if (feedbackData.rows) {
                    setFeedbackRows(feedbackData.rows);
                }
            }

        } catch (error) {
            console.error("Failed to load data", error);
            setError("Failed to load room data");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const saveConfig = async (newConfig: RoomConfig) => {
        setSaving(true);
        try {
            const res = await fetch(`/api/rooms/${id}/config`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newConfig),
            });
            if (res.ok) {
                setConfig(newConfig);
                // toast.success("Saved successfully");
            } else {
                alert("Failed to save changes");
            }
        } catch (error) {
            console.error("Save error", error);
        } finally {
            setSaving(false);
        }
    };

    // Filter feedback by search
    const startFilteredFeedback = feedbackRows.filter(row => {
        if (!feedbackSearch) return true;
        const lowerTerm = feedbackSearch.toLowerCase();
        return row.some(cell => String(cell).toLowerCase().includes(lowerTerm));
    });

    const copyLink = () => {
        const url = `${window.location.origin}/room/${id}`;
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-sympo-orange" />
            </div>
        );
    }

    if (error || !config || !stats) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4">
                <p className="text-red-400 text-lg">{error || "Failed to load room data."}</p>
                <div className="text-xs text-white/30 font-mono">Room ID: {id}</div>
                <Button onClick={() => window.location.reload()} variant="outline" className="border-white/10 hover:bg-white/5">
                    Retry
                </Button>
            </div>
        );
    }

    // Resolve event names in stats using config
    const events = config.events || [];
    const resolvedStats = stats.events.map(e => {
        const originalEvent = events.find(ev => ev.id === e.name);
        return {
            ...e,
            rating: Number(e.rating), // Ensure number for charts
            displayName: originalEvent ? originalEvent.title : e.name
        };
    });

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 space-y-6">
            {/* Background Blobs */}
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-sympo-orange/5 rounded-full blur-[100px] -z-10" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-sympo-blue/5 rounded-full blur-[100px] -z-10" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass p-6 rounded-2xl">
                <div>
                    <h1 className="text-3xl font-bold">{config.globalSettings.title}</h1>
                    <div className="flex items-center gap-2 text-white/60">
                        <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-mono">{id}</span>
                        <span>•</span>
                        <span>Analysis & Management</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" onClick={fetchData} disabled={loading}>
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/')}>
                        <Home className="w-4 h-4 mr-2" />
                        Home
                    </Button>
                    <Button variant="secondary" onClick={copyLink}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                    </Button>
                    <Button onClick={() => window.open(`/room/${id}`, '_blank')}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Feedback Form
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-white/5 border border-white/10 p-1 w-full md:w-auto h-auto grid grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-sympo-orange data-[state=active]:text-white py-2">
                        <BarChart3 className="w-4 h-4 mr-2" /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="events" className="data-[state=active]:bg-sympo-blue data-[state=active]:text-white py-2">
                        <Calendar className="w-4 h-4 mr-2" /> Events
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="data-[state=active]:bg-green-600 data-[state=active]:text-white py-2">
                        <HelpCircle className="w-4 h-4 mr-2" /> Questions
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white py-2">
                        <Settings className="w-4 h-4 mr-2" /> Settings
                    </TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card p-6 flex flex-col items-center justify-center space-y-2">
                            <span className="text-4xl font-bold text-sympo-orange">{stats.summary.totalSubmissions}</span>
                            <span className="text-white/60">Total Responses</span>
                        </div>
                        <div className="glass-card p-6 flex flex-col items-center justify-center space-y-2">
                            <span className="text-4xl font-bold text-sympo-blue">{stats.summary.averageRating}</span>
                            <span className="text-white/60">Avg Rating</span>
                        </div>
                        <div className="glass-card p-6 flex flex-col items-center justify-center space-y-2">
                            <span className="text-4xl font-bold text-green-400">{config.events.length}</span>
                            <span className="text-white/60">Total Events</span>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Bar Chart */}
                        <div className="glass-card p-6 h-[400px]">
                            <h3 className="text-xl font-bold text-white mb-6">Submissions by Event</h3>
                            {resolvedStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="85%">
                                    <BarChart data={resolvedStats}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="displayName" stroke="#ffffff60" fontSize={12} tickFormatter={(val) => val.length > 10 ? `${val.substring(0, 10)}...` : val} />
                                        <YAxis stroke="#ffffff60" allowDecimals={false} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-white/20">No data found</div>
                            )}
                        </div>

                        {/* Pie Chart */}
                        <div className="glass-card p-6 h-[400px]">
                            <h3 className="text-xl font-bold text-white mb-6">Distribution</h3>
                            {resolvedStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="85%">
                                    <PieChart>
                                        <Pie
                                            data={resolvedStats}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="count"
                                            nameKey="displayName"
                                        >
                                            {resolvedStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-white/20">No data found</div>
                            )}
                        </div>
                    </div>

                    {/* Feedback Table Section */}
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Detailed Responses</h2>
                                <p className="text-white/60">Raw feedback data for this room.</p>
                            </div>

                            <div className="flex gap-2">
                                <div className="flex items-center gap-2 glass p-2 rounded-xl border border-white/5 w-full md:w-64">
                                    <Search className="w-5 h-5 text-white/40 ml-2" />
                                    <Input
                                        className="border-0 bg-transparent focus-visible:ring-0 placeholder:text-white/20 h-auto p-0"
                                        placeholder="Search..."
                                        value={feedbackSearch}
                                        onChange={(e) => setFeedbackSearch(e.target.value)}
                                    />
                                </div>
                                <Button variant="secondary" onClick={() => {
                                    const csvContent = "data:text/csv;charset=utf-8,"
                                        + [["Timestamp", "Name", "Department", "Email", "Phone", "Event", "Details"], ...startFilteredFeedback].map(e => e.join(",")).join("\n");
                                    const encodedUri = encodeURI(csvContent);
                                    const link = document.createElement("a");
                                    link.setAttribute("href", encodedUri);
                                    link.setAttribute("download", `feedback_${id}.csv`);
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }} disabled={startFilteredFeedback.length === 0}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Export CSV
                                </Button>
                            </div>
                        </div>

                        <div className="glass rounded-xl overflow-hidden border border-white/5">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-white/80">
                                    <thead className="bg-white/5 text-white font-semibold uppercase text-xs tracking-wider">
                                        <tr>
                                            <th className="p-4">Timestamp</th>
                                            <th className="p-4">Name</th>
                                            <th className="p-4">Department</th>
                                            <th className="p-4">Email</th>
                                            <th className="p-4">Phone</th>
                                            <th className="p-4">Event</th>
                                            <th className="p-4">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {startFilteredFeedback.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center text-white/40">
                                                    No responses found for this room.
                                                </td>
                                            </tr>
                                        ) : (
                                            startFilteredFeedback.map((row, i) => (
                                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-4 whitespace-nowrap text-white/60 text-xs">
                                                        {row[0]}
                                                    </td>
                                                    <td className="p-4 font-medium">{row[1]}</td>
                                                    <td className="p-4 text-white/60">{row[2]}</td>
                                                    <td className="p-4 text-white/60 text-xs max-w-[150px] truncate" title={row[3]}>{row[3]}</td>
                                                    <td className="p-4 text-white/60 text-xs">{row[4]}</td>
                                                    <td className="p-4 font-semibold text-sympo-orange">{row[5]}</td>
                                                    <td className="p-4 text-white/70 max-w-[300px] text-xs">
                                                        {row[6]}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* EVENTS TAB */}
                <TabsContent value="events" className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-white">Event Management</h2>
                            <p className="text-white/60">Configure events for this room.</p>
                        </div>
                    </div>

                    {/* Add Event Section */}
                    <div className="glass p-4 rounded-xl border border-white/5 flex gap-4 items-center">
                        <Input
                            placeholder="Enter new event title..."
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                            className="bg-white/5 border-white/10"
                        />
                        <Button
                            onClick={() => {
                                if (newEventTitle.trim()) {
                                    const newId = newEventTitle.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString().slice(-4);
                                    const newEvent = {
                                        id: newId,
                                        title: newEventTitle,
                                        isActive: true,
                                        questions: [
                                            { id: "q1", type: "rating", label: "Overall Rating", required: true },
                                            { id: "q2", type: "text", label: "Comments", required: false }
                                        ]
                                    };
                                    const newConfig = { ...config, events: [...config.events, newEvent] };
                                    saveConfig(newConfig as RoomConfig);
                                    setNewEventTitle("");
                                }
                            }}
                            disabled={!newEventTitle.trim() || saving}
                            variant="primary"
                            className="bg-sympo-blue hover:bg-blue-600 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {config.events.map((event, index) => (
                            <div key={event.id} className="glass p-4 rounded-xl flex flex-col md:flex-row items-center gap-4 justify-between border border-white/5">
                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-3">
                                        {editingEventId === event.id ? (
                                            <div className="flex items-center gap-2 w-full max-w-sm">
                                                <Input
                                                    value={editEventTitle}
                                                    onChange={(e) => setEditEventTitle(e.target.value)}
                                                    className="h-8 bg-white/10 border-white/20"
                                                />
                                                <Button size="icon" variant="ghost" onClick={() => {
                                                    if (editEventTitle && editEventTitle !== event.title) {
                                                        const newEvents = [...config.events];
                                                        newEvents[index] = { ...event, title: editEventTitle };
                                                        saveConfig({ ...config, events: newEvents });
                                                    }
                                                    setEditingEventId(null);
                                                }}>
                                                    <Check className="w-4 h-4 text-green-400" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => setEditingEventId(null)}>
                                                    <X className="w-4 h-4 text-red-400" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                                        )}

                                        {!editingEventId && (
                                            <Switch
                                                checked={event.isActive}
                                                onCheckedChange={(checked) => {
                                                    const newEvents = [...config.events];
                                                    newEvents[index] = { ...event, isActive: checked };
                                                    saveConfig({ ...config, events: newEvents });
                                                }}
                                            />
                                        )}
                                    </div>
                                    <p className="text-sm text-white/40">ID: {event.id} • {event.questions.length} Questions</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => {
                                        setEditingEventId(event.id);
                                        setEditEventTitle(event.title);
                                    }}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>

                                    {deleteEventId === event.id ? (
                                        <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10" onClick={() => {
                                            const newEvents = config.events.filter(e => e.id !== event.id);
                                            saveConfig({ ...config, events: newEvents });
                                            setDeleteEventId(null);
                                        }}>
                                            Confirm?
                                        </Button>
                                    ) : (
                                        <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10" onClick={() => {
                                            setDeleteEventId(event.id);
                                            // Auto-cancel delete confirmation after 3s
                                            setTimeout(() => setDeleteEventId(null), 3000);
                                        }}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}

                                    <Button size="sm" variant="outline" onClick={() => {
                                        setSelectedEventId(event.id);
                                        setActiveTab("questions");
                                    }}>
                                        Questions
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* QUESTIONS TAB */}
                <TabsContent value="questions" className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-white">Question Builder</h2>
                            <p className="text-white/60">Customize questions for each event.</p>
                        </div>
                        <div className="w-full md:w-72">
                            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                                <SelectTrigger className="glass border-white/10 text-white">
                                    <SelectValue placeholder="Select Event to Edit" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    {config.events.map(e => (
                                        <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {selectedEventId && config.events.find(e => e.id === selectedEventId) ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Question List */}
                            <div className="lg:col-span-2 space-y-4">
                                {config.events.find(e => e.id === selectedEventId)?.questions.map((q, index) => (
                                    <div key={q.id} className="glass p-4 rounded-xl flex items-center gap-4 border border-white/5">
                                        <div className="p-3 bg-white/5 rounded-lg">
                                            {q.type === 'rating' && <Star className="w-5 h-5 text-sympo-orange" />}
                                            {q.type === 'text' && <Type className="w-5 h-5 text-blue-400" />}
                                            {q.type === 'choice' && <List className="w-5 h-5 text-green-400" />}
                                            {q.type === 'reaction-slider' && <Smile className="w-5 h-5 text-yellow-400" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-white flex items-center gap-2">
                                                {q.label}
                                                {q.required && <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">Required</span>}
                                            </div>
                                            <div className="text-xs text-white/40 uppercase">{q.type}</div>
                                        </div>
                                        {deleteQuestionId === q.id ? (
                                            <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10" onClick={() => {
                                                const newConfig = { ...config };
                                                const evtIndex = newConfig.events.findIndex(e => e.id === selectedEventId);
                                                if (evtIndex >= 0) {
                                                    newConfig.events[evtIndex].questions = newConfig.events[evtIndex].questions.filter(qu => qu.id !== q.id);
                                                    saveConfig(newConfig as RoomConfig);
                                                }
                                                setDeleteQuestionId(null);
                                            }}>
                                                Confirm
                                            </Button>
                                        ) : (
                                            <Button size="icon" variant="ghost" className="text-red-400 hover:bg-red-500/10" onClick={() => {
                                                setDeleteQuestionId(q.id);
                                                setTimeout(() => setDeleteQuestionId(null), 3000);
                                            }}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Add Question Panel */}
                            <div className="glass p-6 rounded-xl h-fit space-y-4 border border-white/5">
                                <h3 className="text-lg font-bold text-white">Add Question</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Question Label</Label>
                                        <Input
                                            placeholder="e.g. How was the content?"
                                            value={newQuestionLabel}
                                            onChange={(e) => setNewQuestionLabel(e.target.value)}
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Button variant="outline" className="w-full justify-start text-left" disabled={!newQuestionLabel} onClick={() => {
                                            const newQ = { id: `q-${Date.now()}`, type: 'rating' as const, label: newQuestionLabel, required: true };
                                            const newConfig = { ...config };
                                            const evtIndex = newConfig.events.findIndex(e => e.id === selectedEventId);
                                            newConfig.events[evtIndex].questions.push(newQ);
                                            saveConfig(newConfig as RoomConfig);
                                            setNewQuestionLabel("");
                                        }}>
                                            <Star className="w-4 h-4 mr-2" /> Add Rating
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start text-left" disabled={!newQuestionLabel} onClick={() => {
                                            const newQ = { id: `q-${Date.now()}`, type: 'text' as const, label: newQuestionLabel, required: false };
                                            const newConfig = { ...config };
                                            const evtIndex = newConfig.events.findIndex(e => e.id === selectedEventId);
                                            newConfig.events[evtIndex].questions.push(newQ);
                                            saveConfig(newConfig as RoomConfig);
                                            setNewQuestionLabel("");
                                        }}>
                                            <Type className="w-4 h-4 mr-2" /> Add Text
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start text-left" disabled={!newQuestionLabel} onClick={() => {
                                            const newQ = { id: `q-${Date.now()}`, type: 'reaction-slider' as const, label: newQuestionLabel, required: true };
                                            const newConfig = { ...config };
                                            const evtIndex = newConfig.events.findIndex(e => e.id === selectedEventId);
                                            newConfig.events[evtIndex].questions.push(newQ);
                                            saveConfig(newConfig as RoomConfig);
                                            setNewQuestionLabel("");
                                        }}>
                                            <Smile className="w-4 h-4 mr-2" /> Add Reaction Slider
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-white/40 glass rounded-xl border border-white/5">
                            Select an event above to manage its questions.
                        </div>
                    )}
                </TabsContent>

                {/* SETTINGS TAB */}
                <TabsContent value="settings" className="space-y-6">
                    <div className="glass p-6 rounded-xl border border-white/5 space-y-4">
                        <h2 className="text-xl font-bold text-white">Room Settings</h2>
                        <div className="space-y-2">
                            <Label>Room Title</Label>
                            <div className="flex gap-2">
                                <Input
                                    defaultValue={config.globalSettings.title}
                                    onBlur={(e) => {
                                        if (e.target.value !== config.globalSettings.title) {
                                            saveConfig({
                                                ...config,
                                                globalSettings: { ...config.globalSettings, title: e.target.value }
                                            });
                                        }
                                    }}
                                />
                                <Button disabled>Saved Automatically</Button>
                            </div>
                        </div>
                        <div className="space-y-2 pt-4">
                            <Label>Danger Zone</Label>
                            <Button variant="outline" className="border-red-500 text-red-500 opacity-50 cursor-not-allowed" disabled title="Coming soon">
                                Delete Room
                            </Button>
                        </div>
                    </div>
                </TabsContent>

            </Tabs>

        </div>
    );
}
