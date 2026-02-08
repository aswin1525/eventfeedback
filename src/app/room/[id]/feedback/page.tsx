"use client";

import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { RoomConfig } from "@/types";
import { ParticipantDetails } from "@/components/feedback/ParticipantDetails";
import EventSelector from "@/components/feedback/EventSelector";
import { EventFeedbackForm } from "@/components/feedback/EventFeedbackForm";
import { motion, AnimatePresence } from "framer-motion";

export default function RoomFeedbackPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [config, setConfig] = useState<RoomConfig | null>(null);
    const [step, setStep] = useState<'details' | 'selection' | 'feedback' | 'success'>('details');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [participantData, setParticipantData] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedEvents, setSelectedEvents] = useState<any[]>([]);
    const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [feedbacks, setFeedbacks] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);

    // Derived from params now
    const roomId = id;

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Render Log
    console.log(`[Render] roomId: ${roomId}, step: ${step}, loading: ${isLoading}, error: ${error ? 'YES' : 'NO'}`);

    useEffect(() => {
        let ignore = false;

        console.log(`[Effect START] RoomID: '${roomId}'`);

        if (!roomId) {
            console.log("[Effect] No roomId, returning");
            return;
        }

        setIsLoading(true);
        setError("");

        console.log(`[Effect] Fetching config for ${roomId}...`);

        fetch(`/api/rooms/${roomId}/config`)
            .then(async res => {
                console.log(`[Effect] Response status: ${res.status}`);
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Server responded with ${res.status}: ${text}`);
                }
                return res.json();
            })
            .then(data => {
                if (ignore) {
                    console.log("[Effect] Ignored success (cleanup)");
                    return;
                }
                console.log("[Effect] Success! Data loaded.");
                setConfig(data);
                setError("");
            })
            .catch(err => {
                if (ignore) {
                    console.log("[Effect] Ignored error (cleanup):", err);
                    return;
                }
                console.error("[Effect] Error catch:", err);
                setError(`[DEBUG] Failed to load: ${err.message}`);
            })
            .finally(() => {
                if (ignore) {
                    console.log("[Effect] Ignored finally (cleanup)");
                    return;
                }
                setIsLoading(false);
            });

        return () => {
            console.log("[Effect] Cleanup called");
            ignore = true;
        };
    }, [roomId]);

    const retryLoad = () => {
        console.log("[Retry] Retrying load...");
        setIsLoading(true);
        setError("");
        fetch(`/api/rooms/${roomId}/config`)
            .then(async res => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Server responded with ${res.status}: ${text}`);
                }
                return res.json();
            })
            .then(data => {
                console.log("[Retry] Success");
                setConfig(data);
            })
            .catch(err => {
                console.error("[Retry] Error:", err);
                setError(`[DEBUG] Retry failed: ${err.message}`);
            })
            .finally(() => setIsLoading(false));
    };

    const handleDetailsSubmit = (data: unknown) => {
        setParticipantData(data);
        setStep('selection');
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEventsSelected = (events: any[]) => {
        if (events.length === 0) return;
        setSelectedEvents(events);
        setStep('feedback');
        setCurrentFeedbackIndex(0);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFeedbackSubmit = async (data: any) => {
        const currentEventId = selectedEvents[currentFeedbackIndex].id;
        const newFeedbacks = { ...feedbacks, [currentEventId]: data };
        setFeedbacks(newFeedbacks);

        if (currentFeedbackIndex < selectedEvents.length - 1) {
            setCurrentFeedbackIndex(prev => prev + 1);
        } else {
            // All done, submit to server
            setSubmitting(true);
            try {
                const payload = {
                    roomId,
                    user: participantData,
                    feedbacks: newFeedbacks,
                    submittedAt: new Date().toISOString()
                };

                await fetch('/api/submit', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                setStep('success');
            } catch (error) {
                console.error("Submission error", error);
                alert("Failed to submit feedback. Please try again.");
            } finally {
                setSubmitting(false);
            }
        }
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-sympo-orange w-10 h-10" /></div>;

    if (error) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4 p-4 text-center">
            <p className="text-red-400 text-lg">{error}</p>
            <Button onClick={retryLoad} variant="outline" className="border-white/10 hover:bg-white/5">
                Try Again
            </Button>
            <div className="text-xs text-white/30 font-mono mt-4">
                Room ID: {roomId ? `'${roomId}'` : "undefined"}
            </div>
        </div>
    );

    // Guard to ensure config is loaded before rendering main content
    if (!config) return null;

    const currentEvent = selectedEvents[currentFeedbackIndex];

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-sympo-orange/10 rounded-full blur-[120px] animate-blob" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-sympo-blue/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />

            <div className="w-full max-w-2xl relative z-10">

                {/* Header Info */}
                {step !== 'success' && (
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-medium text-white/50">{config.globalSettings.title}</h2>
                        {step === 'feedback' && (
                            <div className="flex gap-1 justify-center mt-2">
                                {selectedEvents.map((_, i) => (
                                    <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i <= currentFeedbackIndex ? 'w-8 bg-sympo-orange' : 'w-2 bg-white/10'}`} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <AnimatePresence mode="wait">

                    {/* Step 1: Details */}
                    {step === 'details' && (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        >
                            <ParticipantDetails
                                fields={config.participantFields}
                                onNext={handleDetailsSubmit}
                            />
                        </motion.div>
                    )}

                    {/* Step 2: Select Events */}
                    {step === 'selection' && (
                        <motion.div
                            key="selection"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
                        >
                            <div className="mb-4">
                                <Button variant="ghost" className="text-white/60 pl-0 hover:text-white" onClick={() => setStep('details')}>
                                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                </Button>
                            </div>
                            <EventSelector
                                preLoadedEvents={config.events}
                                onNext={handleEventsSelected}
                            />
                        </motion.div>
                    )}

                    {/* Step 3: Feedback Form */}
                    {step === 'feedback' && (
                        <motion.div
                            key={`feedback-${currentEvent.id}`}
                            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <Button variant="ghost" className="text-white/60 pl-0 hover:text-white" onClick={() => {
                                    if (currentFeedbackIndex > 0) setCurrentFeedbackIndex(prev => prev - 1);
                                    else setStep('selection');
                                }}>
                                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                </Button>
                                <span className="text-sm text-white/40">Event {currentFeedbackIndex + 1} of {selectedEvents.length}</span>
                            </div>

                            <EventFeedbackForm
                                eventName={currentEvent.title}
                                questions={currentEvent.questions}
                                onNext={handleFeedbackSubmit}
                                onBack={() => {
                                    if (currentFeedbackIndex > 0) setCurrentFeedbackIndex(prev => prev - 1);
                                    else setStep('selection');
                                }}
                                isLastStep={currentFeedbackIndex === selectedEvents.length - 1}
                            />
                        </motion.div>
                    )}

                    {/* Step 4: Success */}
                    {step === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                            className="glass p-12 rounded-3xl text-center space-y-6 border border-white/10"
                        >
                            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30 animate-pulse">
                                <CheckCircle2 className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-4xl font-bold text-white">Thank You!</h2>
                            <p className="text-white/60 text-lg">Your feedback helps us create better experiences.</p>
                            <Button size="lg" className="mt-8" onClick={() => window.location.reload()}>Submit Another</Button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
