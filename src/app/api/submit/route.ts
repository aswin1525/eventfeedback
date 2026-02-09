import { NextResponse } from 'next/server';
import { appendToSheet } from '@/lib/sheets';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { user, feedbacks, submittedAt } = body;

        // Flatten data for Sheets:
        // [Timestamp, Name, Dept, Email, Phone, Event1_Rating, Event1_Comment, ..., EventN_Rating...]

        // For simplicity, we'll store one row per Event Feedback to allow easier analysis
        // Columns: Timestamp, Name, Dept, Email, Phone, Event Name, Rating, Content, Speaker, Time, Comment

        const rows: string[][] = [];

        Object.entries(feedbacks).forEach(([eventId, feedback]: [string, any]) => {
            // Convert dynamic feedback object to readable string
            // e.g. "q1: 5 | q2: Great session"
            // Ideally we would map question IDs to labels, but we don't have config here easily without reading it.
            // For now, just dumping values.

            const feedbackSummary = Object.entries(feedback)
                .map(([key, val]) => `${key}: ${val}`)
                .join(" | ");

            rows.push([
                submittedAt,
                user.name,
                user.department,
                user.email || 'N/A',
                user.phone || 'N/A',
                eventId,
                feedbackSummary,
                body.roomId || "UNKNOWN_ROOM", // Column H: RoomID
                JSON.stringify(feedback)       // Column I: RawJSON
            ]);
        });


        const success = await appendToSheet(rows);

        // FIREBASE STORAGE
        try {
            const { db } = await import('@/lib/firebase');

            // Create submission record
            const submissionRecord = {
                submittedAt,
                user,
                feedbacks, // Store the raw structure
                userAgent: request.headers.get('user-agent'),
            };

            // Save to sub-collection 'submissions' in the room document
            await db.collection('rooms').doc(body.roomId).collection('submissions').add(submissionRecord);

            // Optional: Update room stats (increment submission count)
            await db.collection('rooms').doc(body.roomId).set({
                // We could use FieldValue.increment here if we import it, 
                // but for now let's just ensure the document exists.
                lastSubmissionAt: submittedAt
            }, { merge: true });

        } catch (firebaseError) {
            console.error("Firebase Save Error:", firebaseError);
        }

        if (!success) {
            console.warn("Failed to write to Google Sheets. Data failed to sheet but saved locally if successful.");
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Submission Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
