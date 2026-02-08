import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { EventConfig } from "@/types";
import { Loader2, Check } from "lucide-react";

interface EventSelectorProps {
    onNext: (selectedEvents: EventConfig[]) => void;
    preLoadedEvents?: EventConfig[];
    onBack?: () => void; // Optional if not always used
}

export default function EventSelector({ onNext, preLoadedEvents, onBack }: EventSelectorProps) {
    const [events, setEvents] = useState<EventConfig[]>(preLoadedEvents || []);
    const [loading, setLoading] = useState(!preLoadedEvents);
    const [selected, setSelected] = useState<string[]>([]); // Changed to array for easier usage
    const [error, setError] = useState(false);

    useEffect(() => {
        if (preLoadedEvents) {
            setEvents(preLoadedEvents);
            setLoading(false);
        }
    }, [preLoadedEvents]);

    const toggleEvent = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
        );
    };

    const handleNext = () => {
        if (selected.length === 0) return;
        const selectedEventObjs = events.filter(e => selected.includes(e.id));
        onNext(selectedEventObjs);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-sympo-orange" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Select Events</h2>
                <p className="text-white/60">Which sessions did you attend?</p>
            </div>

            <div className="space-y-3 glass p-4 rounded-xl max-h-[60vh] overflow-y-auto custom-scrollbar">
                {events.length === 0 ? (
                    <div className="text-center text-white/40 py-4">No active events found.</div>
                ) : (
                    events.map((event) => {
                        const isSelected = selected.includes(event.id);
                        return (
                            <div
                                key={event.id}
                                className={`p-4 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-between border ${isSelected
                                    ? "bg-sympo-orange/10 border-sympo-orange/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                                    : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10"
                                    }`}
                                onClick={() => toggleEvent(event.id)}
                            >
                                <span className={`font-medium transition-colors ${isSelected ? 'text-white' : 'text-white/70'}`}>
                                    {event.title}
                                </span>

                                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-200 ${isSelected
                                    ? 'bg-sympo-orange border-sympo-orange scale-110'
                                    : 'border-white/20 bg-black/20 group-hover:border-white/40'
                                    }`}>
                                    <Check className={`w-4 h-4 text-white transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="pt-4 flex gap-3">
                <Button variant="ghost" type="button" onClick={onBack} className="flex-1">
                    Back
                </Button>
                <Button
                    onClick={handleNext}
                    className="flex-1"
                    disabled={selected.length === 0}
                >
                    Next ({selected.length})
                </Button>
            </div>
        </div>
    );
}

