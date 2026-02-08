"use client";

import { useState } from "react";
import { ParticipantDetails, ParticipantData } from "@/components/feedback/ParticipantDetails";
import { EventSelector } from "@/components/feedback/EventSelector";
import { EventFeedbackForm, EventFeedbackData } from "@/components/feedback/EventFeedbackForm";
import { SuccessMessage } from "@/components/feedback/SuccessMessage";
import { EventConfig } from "@/types";

export default function FeedbackPage() {
    const [step, setStep] = useState(0); // 0: Details, 1: Selection, 2+: Feedback by index, Last: Success
    const [userData, setUserData] = useState<ParticipantData | null>(null);
    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
    const [allEvents, setAllEvents] = useState<EventConfig[]>([]);
    const [feedbacks, setFeedbacks] = useState<Record<string, EventFeedbackData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Steps calculation
    // Step 0: User Info
    // Step 1: Event Selection
    // Step 2...2+N: Individual Event Feedback (where N is selectedEvents.length)
    // Step Last: Success

    const handleUserSubmit = (data: ParticipantData) => {
        setUserData(data);
        setStep(1);
    };

    const handleSelectionSubmit = (selectedIds: string[], events: EventConfig[]) => {
        setSelectedEvents(selectedIds);
        setAllEvents(events);
        setStep(2); // Move to first event
    };

    const handleEventFeedbackSubmit = async (data: EventFeedbackData) => {
        // Current event index based on step
        const currentEventIndex = step - 2;
        const currentEventId = selectedEvents[currentEventIndex];

        // Save feedback
        const newFeedbacks = { ...feedbacks, [currentEventId]: data };
        setFeedbacks(newFeedbacks);

        // Check if more events
        if (currentEventIndex < selectedEvents.length - 1) {
            setStep(step + 1);
        } else {
            // Final Submission
            await submitAllData(userData!, newFeedbacks);
        }
    };

    const submitAllData = async (user: ParticipantData, allFeedbacks: Record<string, EventFeedbackData>) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user,
                    feedbacks: allFeedbacks,
                    submittedAt: new Date().toISOString(),
                }),
            });

            if (!response.ok) throw new Error('Submission failed');

            setStep(step + 2); // Jump to success (safely beyond feedback steps)
        } catch (error) {
            console.error(error);
            alert("Failed to submit feedback. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    // Render Logic
    const renderStep = () => {
        if (step === 0) {
            return <ParticipantDetails initialData={userData || undefined} onNext={handleUserSubmit} />;
        }

        if (step === 1) {
            return (
                <EventSelector
                    initialSelected={selectedEvents}
                    onNext={handleSelectionSubmit}
                    onBack={handleBack}
                />
            );
        }

        const eventIndex = step - 2;
        if (eventIndex >= 0 && eventIndex < selectedEvents.length) {
            const eventId = selectedEvents[eventIndex];
            const eventConfig = allEvents.find(e => e.id === eventId);
            const isLast = eventIndex === selectedEvents.length - 1;

            if (!eventConfig) {
                return <div>Error: Event config not found</div>;
            }

            return (
                <EventFeedbackForm
                    key={eventId}
                    eventName={eventConfig.title}
                    questions={eventConfig.questions}
                    onNext={handleEventFeedbackSubmit}
                    onBack={handleBack}
                    isLastStep={isLast}
                    isSubmitting={isSubmitting && isLast}
                    initialData={feedbacks[eventId]}
                />
            );
        }

        return <SuccessMessage />;
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden relative">
            {/* Background Blobs (Static for performance) */}
            <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-sympo-orange/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-sympo-blue/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="z-10 w-full max-w-xl">
                {/* Progress Bar (Optional) */}
                {step > 0 && step < 2 + selectedEvents.length && (
                    <div className="mb-8 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-sympo-orange to-sympo-blue transition-all duration-500 ease-out"
                            style={{ width: `${(step / (2 + selectedEvents.length)) * 100}%` }}
                        />
                    </div>
                )}

                <div className="glass-card p-6 md:p-8 min-h-[400px] flex flex-col justify-center">
                    {renderStep()}
                </div>
            </div>
        </main>
    );
}

