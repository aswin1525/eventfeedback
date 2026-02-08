"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EventConfig, AppConfig } from "@/types";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function EventsManager() {
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editing State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ title: string; isActive: boolean }>({ title: "", isActive: true });

    // New Event State
    const [isAdding, setIsAdding] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState("");

    const fetchConfig = async () => {
        try {
            const res = await fetch("/api/admin/config");
            const data = await res.json();
            setConfig(data);
        } catch (error) {
            console.error("Failed to load config", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const saveConfig = async (newConfig: AppConfig) => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newConfig),
            });
            if (res.ok) {
                setConfig(newConfig);
                setEditingId(null);
                setIsAdding(false);
                setNewEventTitle("");
            } else {
                alert("Failed to save changes");
            }
        } catch (error) {
            console.error("Save error", error);
            alert("Error saving configuration");
        } finally {
            setSaving(false);
        }
    };

    const handleAddEvent = () => {
        if (!config || !newEventTitle.trim()) return;

        const newId = newEventTitle.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString().slice(-4);
        const newEvent: EventConfig = {
            id: newId,
            title: newEventTitle,
            isActive: true,
            questions: [
                { id: "q1", type: "rating", label: "Overall Rating", required: true },
                { id: "q2", type: "text", label: "Comments", required: false }
            ]
        };

        const newConfig = {
            ...config,
            events: [...config.events, newEvent]
        };

        saveConfig(newConfig);
    };

    const handleDeleteEvent = (id: string) => {
        if (!config || !confirm("Are you sure you want to delete this event? All associated feedback data might lose its reference context.")) return;

        const newConfig = {
            ...config,
            events: config.events.filter(e => e.id !== id)
        };

        saveConfig(newConfig);
    };

    const startEdit = (event: EventConfig) => {
        setEditingId(event.id);
        setEditForm({ title: event.title, isActive: event.isActive });
    };

    const saveEdit = () => {
        if (!config || !editingId) return;

        const newConfig = {
            ...config,
            events: config.events.map(e =>
                e.id === editingId
                    ? { ...e, title: editForm.title, isActive: editForm.isActive }
                    : e
            )
        };

        saveConfig(newConfig);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-sympo-orange" />
            </div>
        );
    }

    if (!config) return <div className="text-white">Failed to load configuration.</div>;

    return (
        <div className="space-y-6 p-4 md:p-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Event Management</h1>
                    <p className="text-white/60">Manage your events and workshops.</p>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)} variant="primary">
                    {isAdding ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {isAdding ? "Cancel" : "Add Event"}
                </Button>
            </div>

            {/* Add Event Form */}
            {isAdding && (
                <div className="glass p-6 rounded-xl space-y-4 border border-sympo-orange/30">
                    <h3 className="text-lg font-bold text-white">New Event Details</h3>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <Label>Event Title</Label>
                            <Input
                                value={newEventTitle}
                                onChange={(e) => setNewEventTitle(e.target.value)}
                                placeholder="e.g. Technical Quiz"
                            />
                        </div>
                        <Button onClick={handleAddEvent} disabled={saving || !newEventTitle.trim()}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Event
                        </Button>
                    </div>
                </div>
            )}

            {/* Events List */}
            <div className="grid grid-cols-1 gap-4">
                {config.events.map((event) => (
                    <div key={event.id} className="glass p-4 rounded-xl flex flex-col md:flex-row items-center gap-4 justify-between border border-white/5 hover:border-white/10 transition-colors">
                        {editingId === event.id ? (
                            // Edit Mode
                            <div className="flex-1 w-full gap-4 flex flex-col md:flex-row items-center">
                                <div className="flex-1 w-full">
                                    <Label className="text-xs text-white/40 mb-1 block">Event Title</Label>
                                    <Input
                                        value={editForm.title}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label className="text-xs text-white/40">Active</Label>
                                    <Switch
                                        checked={editForm.isActive}
                                        onCheckedChange={(c) => setEditForm(prev => ({ ...prev, isActive: c }))}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="primary" onClick={saveEdit} disabled={saving}>
                                        <Check className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                                        <span className={`px-2 py-0.5 text-xs rounded-full ${event.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {event.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/40">ID: {event.id} • {event.questions.length} Questions</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => startEdit(event)}>
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleDeleteEvent(event.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {config.events.length === 0 && (
                    <div className="text-center py-12 text-white/40 glass rounded-xl">
                        No events found. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
