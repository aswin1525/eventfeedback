import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star } from "lucide-react";
import { useState } from "react";
import { Question } from "@/types";
import { ReactionSlider } from "./ReactionSlider";

export interface EventFeedbackData {
    [key: string]: any;
}

interface EventFeedbackFormProps {
    eventName: string;
    questions: Question[];
    initialData?: Partial<EventFeedbackData>;
    onNext: (data: EventFeedbackData) => void;
    onBack: () => void;
    isLastStep: boolean;
    isSubmitting?: boolean;
}

export function EventFeedbackForm({
    eventName,
    questions,
    initialData,
    onNext,
    onBack,
    isLastStep,
    isSubmitting
}: EventFeedbackFormProps) {

    const [data, setData] = useState<EventFeedbackData>(initialData || {});

    const isValid = questions.every(q => {
        if (!q.required) return true;
        const val = data[q.id];
        return val !== undefined && val !== "" && val !== 0 && val !== null;
    });

    const handleChange = (id: string, value: any) => {
        setData(prev => ({ ...prev, [id]: value }));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white max-w-md mx-auto">{eventName}</h2>
                <p className="text-white/60">How was this session?</p>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar px-1">
                {questions.map((q) => (
                    <div key={q.id} className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                        <Label className="text-lg font-medium">{q.label} {q.required ? <span className="text-red-400">*</span> : ""}</Label>

                        {q.type === 'reaction-slider' ? (
                            <ReactionSlider
                                value={data[q.id] || 3}
                                onChange={(val) => handleChange(q.id, val)}
                            />
                        ) : q.type === 'rating' ? (
                            <StarRating
                                label=""
                                value={data[q.id]}
                                onChange={(v) => handleChange(q.id, v)}
                            />
                        ) : q.type === 'text' ? (
                            <Textarea
                                value={data[q.id] || ""}
                                onChange={(e) => handleChange(q.id, e.target.value)}
                                placeholder="Type your feedback here..."
                                className="glass-input min-h-[120px] text-lg bg-black/20"
                            />
                        ) : (
                            <div className="text-red-400 text-sm p-2 bg-red-500/10 rounded">
                                Unknown question type: {q.type} (Defaulting to Text)
                                <Textarea
                                    value={data[q.id] || ""}
                                    onChange={(e) => handleChange(q.id, e.target.value)}
                                    placeholder="Type your feedback here..."
                                    className="glass-input min-h-[120px] text-lg bg-black/20 mt-2"
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="pt-4 flex gap-3">
                <Button variant="ghost" type="button" onClick={onBack} className="flex-1">
                    Back
                </Button>
                <Button
                    onClick={() => onNext(data)}
                    className="flex-1"
                    disabled={!isValid || isSubmitting}
                >
                    {isLastStep ? "Submit All" : "Next Event"}
                </Button>
            </div>
        </div>
    );
}

const StarRating = ({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) => (
    <div className="space-y-1">
        {label && <Label>{label}</Label>}
        <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                >
                    <Star
                        className={`w-8 h-8 ${star <= (value || 0) ? "fill-sympo-orange text-sympo-orange" : "text-white/20"
                            } transition-colors duration-200`}
                    />
                </button>
            ))}
        </div>
    </div>
);

