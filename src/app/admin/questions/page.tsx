"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppConfig, Question } from "@/types";
import { Plus, Trash2, Loader2, Save, GripVertical, Star, Type, List, Smile } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function QuestionBuilder() {
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string>("");

    // New Question State
    const [newQType, setNewQType] = useState<Question['type']>("rating");
    const [newQLabel, setNewQLabel] = useState("");
    const [newQRequired, setNewQRequired] = useState(true);

    const fetchConfig = async () => {
        try {
            const res = await fetch("/api/admin/config");
            const data = await res.json();
            setConfig(data);
            if (data.events.length > 0 && !selectedEventId) {
                setSelectedEventId(data.events[0].id);
            }
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
                setNewQLabel("");
            } else {
                alert("Failed to save changes");
            }
        } catch (error) {
            console.error("Save error", error);
        } finally {
            setSaving(false);
        }
    };

    const handleAddQuestion = () => {
        if (!config || !selectedEventId || !newQLabel.trim()) return;

        const newQuestion: Question = {
            id: `q-${Date.now()}`,
            type: newQType,
            label: newQLabel,
            required: newQRequired,
            options: newQType === 'choice' ? ["Option 1", "Option 2"] : undefined
        };

        const newConfig = {
            ...config,
            events: config.events.map(e => {
                if (e.id === selectedEventId) {
                    return {
                        ...e,
                        questions: [...e.questions, newQuestion]
                    };
                }
                return e;
            })
        };

        saveConfig(newConfig);
    };

    const handleDeleteQuestion = (qId: string) => {
        if (!config || !selectedEventId) return;

        const newConfig = {
            ...config,
            events: config.events.map(e => {
                if (e.id === selectedEventId) {
                    return {
                        ...e,
                        questions: e.questions.filter(q => q.id !== qId)
                    };
                }
                return e;
            })
        };

        saveConfig(newConfig);
    };

    const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
        if (!config || !selectedEventId) return;

        const event = config.events.find(e => e.id === selectedEventId);
        if (!event) return;

        const questions = [...event.questions];
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= questions.length) return;

        // Swap
        [questions[index], questions[newIndex]] = [questions[newIndex], questions[index]];

        const newConfig = {
            ...config,
            events: config.events.map(e => e.id === selectedEventId ? { ...e, questions } : e)
        };

        saveConfig(newConfig);
    };

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-sympo-orange" /></div>;
    if (!config) return <div className="text-white">Failed to load configuration.</div>;

    const selectedEvent = config.events.find(e => e.id === selectedEventId);

    return (
        <div className="space-y-6 p-4 md:p-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Question Builder</h1>
                    <p className="text-white/60">Customize feedback forms for each event.</p>
                </div>

                {/* Event Selector */}
                <div className="w-full md:w-72">
                    <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                        <SelectTrigger className="glass border-white/10 text-white">
                            <SelectValue placeholder="Select Event" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                            {config.events.map(e => (
                                <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Visual Preview / List */}
                <div className="lg:col-span-2 space-y-4">
                    {!selectedEvent ? (
                        <div className="glass p-12 rounded-xl text-center text-white/40">Select an event to manage questions</div>
                    ) : (
                        <>
                            {selectedEvent.questions.map((q, index) => (
                                <div key={q.id} className="glass p-4 rounded-xl flex items-center gap-4 group">
                                    <div className="flex flex-col gap-1 text-white/20">
                                        <Button
                                            size="icon" variant="ghost" className="h-6 w-6 hover:text-white"
                                            onClick={() => handleMoveQuestion(index, 'up')}
                                            disabled={index === 0 || saving}
                                        >
                                            ▲
                                        </Button>
                                        <Button
                                            size="icon" variant="ghost" className="h-6 w-6 hover:text-white"
                                            onClick={() => handleMoveQuestion(index, 'down')}
                                            disabled={index === selectedEvent.questions.length - 1 || saving}
                                        >
                                            ▼
                                        </Button>
                                    </div>

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

                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-white/20 hover:text-red-400 hover:bg-red-500/10"
                                        onClick={() => handleDeleteQuestion(q.id)}
                                        disabled={saving}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}

                            {selectedEvent.questions.length === 0 && (
                                <div className="text-center py-12 text-white/40 glass rounded-xl">
                                    No questions added yet.
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Add New Question Panel */}
                <div className="glass p-6 rounded-xl h-fit space-y-6 border border-white/5">
                    <h3 className="text-xl font-bold text-white">Add Question</h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Question Label</Label>
                            <Input
                                value={newQLabel}
                                onChange={(e) => setNewQLabel(e.target.value)}
                                placeholder="e.g. Rate the speaker..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Question Type</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant={newQType === 'rating' ? 'primary' : 'outline'}
                                    className={cn("justify-start", newQType !== 'rating' && "border-white/10 text-white/60")}
                                    onClick={() => setNewQType('rating')}
                                >
                                    <Star className="w-4 h-4 mr-2" /> Rating
                                </Button>
                                <Button
                                    variant={newQType === 'text' ? 'primary' : 'outline'}
                                    className={cn("justify-start", newQType !== 'text' && "border-white/10 text-white/60")}
                                    onClick={() => setNewQType('text')}
                                >
                                    <Type className="w-4 h-4 mr-2" /> Text
                                </Button>
                                <Button
                                    variant={newQType === 'reaction-slider' ? 'primary' : 'outline'}
                                    className={cn("justify-start col-span-2", newQType !== 'reaction-slider' && "border-white/10 text-white/60")}
                                    onClick={() => setNewQType('reaction-slider')}
                                >
                                    <Smile className="w-4 h-4 mr-2" /> Reaction Slider
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <Label>Required?</Label>
                            <Switch
                                checked={newQRequired}
                                onCheckedChange={setNewQRequired}
                            />
                        </div>

                        <Button
                            className="w-full"
                            variant="primary"
                            onClick={handleAddQuestion}
                            disabled={!selectedEventId || !newQLabel.trim() || saving}
                        >
                            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                            Add to Form
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
