"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RoomConfig, EventConfig, Question } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, Loader2, Plus, Trash2, Save, Link2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDefaultRoom } from "@/lib/store"; // We can't import server code here. Copying utility logic/types locally or assuming structure.

// Helper to create empty structure
const initialConfig = (name: string): RoomConfig => ({
    id: "",
    metadata: { id: "", name: "", createdAt: "", eventCount: 0 },
    globalSettings: { title: name, description: "We value your feedback!", logo: "" },
    participantFields: {
        name: { enabled: true, required: true, label: "Full Name" },
        department: { enabled: true, required: true, label: "Department" },
        email: { enabled: true, required: false, label: "Email" },
        phone: { enabled: true, required: false, label: "Phone" }
    },
    events: []
});

export default function CreateWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState<RoomConfig>(initialConfig(""));
    const [generatedLink, setGeneratedLink] = useState("");

    // Step 1: Basic Info
    const handleBasicInfoSubmit = () => {
        if (!config.globalSettings.title) return;
        setStep(2);
    };

    // Step 2: Events
    const [newEventTitle, setNewEventTitle] = useState("");
    const addEvent = () => {
        if (!newEventTitle.trim()) return;
        const newEvent: EventConfig = {
            id: `evt-${Date.now()}`,
            title: newEventTitle,
            isActive: true,
            questions: []
        };
        setConfig(prev => ({
            ...prev,
            events: [...prev.events, newEvent]
        }));
        setNewEventTitle("");
    };

    const removeEvent = (id: string) => {
        setConfig(prev => ({
            ...prev,
            events: prev.events.filter(e => e.id !== id)
        }));
    };

    // Step 3: Questions
    const [selectedEventId, setSelectedEventId] = useState<string>("");
    const [newQ, setNewQ] = useState<{ label: string, type: Question['type'] }>({ label: "", type: "rating" });

    const addQuestion = () => {
        if (!selectedEventId || !newQ.label) return;

        const question: Question = {
            id: `q-${Date.now()}`,
            label: newQ.label,
            type: newQ.type,
            required: true
        };

        setConfig(prev => ({
            ...prev,
            events: prev.events.map(e => {
                if (e.id === selectedEventId) {
                    return { ...e, questions: [...e.questions, question] };
                }
                return e;
            })
        }));
        setNewQ({ ...newQ, label: "" });
    };

    const removeQuestion = (eventId: string, qId: string) => {
        setConfig(prev => ({
            ...prev,
            events: prev.events.map(e => {
                if (e.id === eventId) {
                    return { ...e, questions: e.questions.filter(q => q.id !== qId) };
                }
                return e;
            })
        }));
    };

    // Final Submit
    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 1. Create Room ID Shell
            const res = await fetch("/api/rooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: config.globalSettings.title })
            });
            const data = await res.json();

            if (data.id) {
                // 2. Update with full config
                const fullConfig = { ...config, id: data.id, metadata: { ...config.metadata, id: data.id, name: config.globalSettings.title, createdAt: new Date().toISOString(), eventCount: config.events.length } };

                await fetch(`/api/rooms/${data.id}/config`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(fullConfig)
                });

                setGeneratedLink(`${window.location.origin}/room/${data.id}`);
                setStep(4);
            }
        } catch (error) {
            console.error("Creation failed", error);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { num: 1, title: "Organization" },
        { num: 2, title: "Events" },
        { num: 3, title: "Questions" },
        { num: 4, title: "Finish" },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center py-12 px-4">
            {/* Progress Steps */}
            <div className="flex items-center gap-4 mb-12">
                {steps.map((s) => (
                    <div key={s.num} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s.num ? 'bg-sympo-orange text-white' : 'bg-white/10 text-white/40'}`}>
                            {s.num}
                        </div>
                        <span className={`text-sm ${step >= s.num ? 'text-white' : 'text-white/40'}`}>{s.title}</span>
                        {s.num < 4 && <div className="w-8 h-[1px] bg-white/10 mx-2" />}
                    </div>
                ))}
            </div>

            <div className="w-full max-w-2xl glass p-8 rounded-3xl border border-white/5 relative overflow-hidden min-h-[500px] flex flex-col">
                <AnimatePresence mode="wait">

                    {/* Step 1: Info */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="flex-1 space-y-6"
                        >
                            <h2 className="text-2xl font-bold">Organization Details</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Organization Name / Title</Label>
                                    <Input
                                        placeholder="e.g. Acme Corp Symposium 2024"
                                        value={config.globalSettings.title}
                                        onChange={(e) => setConfig({ ...config, globalSettings: { ...config.globalSettings, title: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        placeholder="Brief welcome message..."
                                        value={config.globalSettings.description}
                                        onChange={(e) => setConfig({ ...config, globalSettings: { ...config.globalSettings, description: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Logo URL (Optional)</Label>
                                    <Input
                                        placeholder="https://..."
                                        value={config.globalSettings.logo}
                                        onChange={(e) => setConfig({ ...config, globalSettings: { ...config.globalSettings, logo: e.target.value } })}
                                    />
                                </div>
                            </div>
                            <div className="pt-8 flex justify-end">
                                <Button onClick={handleBasicInfoSubmit} disabled={!config.globalSettings.title}>Next Step <ArrowRight className="ml-2 w-4 h-4" /></Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Events */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="flex-1 space-y-6"
                        >
                            <h2 className="text-2xl font-bold">Add Events</h2>
                            <p className="text-white/60">List all the workshops, talks, or sessions.</p>

                            <div className="flex gap-2">
                                <Input
                                    placeholder="Event Title..."
                                    value={newEventTitle}
                                    onChange={(e) => setNewEventTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addEvent()}
                                />
                                <Button variant="secondary" onClick={addEvent}><Plus className="w-4 h-4" /></Button>
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {config.events.map(event => (
                                    <div key={event.id} className="bg-white/5 p-3 rounded-xl flex justify-between items-center">
                                        <span>{event.title}</span>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white/40 hover:text-red-400" onClick={() => removeEvent(event.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                {config.events.length === 0 && <p className="text-center text-white/20 py-8">No events added yet.</p>}
                            </div>

                            <div className="pt-8 flex justify-between">
                                <Button variant="ghost" onClick={() => setStep(1)}><ChevronLeft className="mr-2 w-4 h-4" /> Back</Button>
                                <Button onClick={() => setStep(3)} disabled={config.events.length === 0}>Next Step <ArrowRight className="ml-2 w-4 h-4" /></Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Questions */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="flex-1 space-y-6"
                        >
                            <h2 className="text-2xl font-bold">Configure Questions</h2>
                            <p className="text-white/60">Add feedback questions to your events.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
                                {/* Event List */}
                                <div className="space-y-2 overflow-y-auto pr-2">
                                    <Label className="text-white/40">Select Event</Label>
                                    {config.events.map(event => (
                                        <div
                                            key={event.id}
                                            onClick={() => setSelectedEventId(event.id)}
                                            className={`p-3 rounded-xl cursor-pointer transition-colors ${selectedEventId === event.id ? 'bg-sympo-orange text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                                        >
                                            <div className="font-medium">{event.title}</div>
                                            <div className="text-xs opacity-60">{event.questions.length} questions</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Questions for selected event */}
                                <div className="space-y-4 flex flex-col">
                                    <Label className="text-white/40">Questions</Label>
                                    {selectedEventId ? (
                                        <>
                                            <div className="flex-1 overflow-y-auto space-y-2 bg-black/20 p-2 rounded-xl">
                                                {config.events.find(e => e.id === selectedEventId)?.questions.map(q => (
                                                    <div key={q.id} className="flex justify-between items-center text-sm p-2 bg-white/5 rounded-lg">
                                                        <span>{q.label} <span className="text-xs opacity-50">({q.type})</span></span>
                                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeQuestion(selectedEventId, q.id)}>
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="space-y-2 bg-white/5 p-3 rounded-xl">
                                                <Input
                                                    placeholder="Question..."
                                                    value={newQ.label}
                                                    onChange={(e) => setNewQ({ ...newQ, label: e.target.value })}
                                                />
                                                <div className="flex gap-2">
                                                    <Select value={newQ.type} onValueChange={(v: any) => setNewQ({ ...newQ, type: v })}>
                                                        <SelectTrigger className="glass border-white/10 h-9">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-900 border-white/10">
                                                            <SelectItem value="rating">Rating (Stars)</SelectItem>
                                                            <SelectItem value="text">Text Input</SelectItem>
                                                            <SelectItem value="reaction-slider">Reaction Slider</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button size="sm" onClick={addQuestion} disabled={!newQ.label}><Plus className="w-4 h-4" /></Button>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center text-white/20">Select an event to add questions</div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2 flex justify-between">
                                <Button variant="ghost" onClick={() => setStep(2)}><ChevronLeft className="mr-2 w-4 h-4" /> Back</Button>
                                <Button onClick={handleSubmit} disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Create Room
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Finish */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 flex flex-col items-center justify-center space-y-8 text-center"
                        >
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                                <Save className="w-10 h-10 text-white" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold">Room Created!</h2>
                                <p className="text-white/60">Your feedback room is ready to accept submissions.</p>
                            </div>

                            <div className="w-full max-w-md bg-black/30 p-4 rounded-xl flex items-center gap-2 border border-white/10">
                                <Link2 className="w-5 h-5 text-sympo-orange" />
                                <code className="flex-1 text-sm overflow-hidden text-ellipsis whitespace-nowrap text-left text-white/80">{generatedLink}</code>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="secondary" onClick={() => window.open(generatedLink, '_blank')}>Open Room</Button>
                                <Button onClick={() => router.push('/')}>Back to Dashboard</Button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
