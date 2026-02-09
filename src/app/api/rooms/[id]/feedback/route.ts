import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const { db } = await import('@/lib/firebase');

        let submissions: any[] = [];
        try {
            const snapshot = await db.collection('rooms').doc(id).collection('submissions').orderBy('submittedAt', 'desc').get();
            submissions = snapshot.docs.map(doc => doc.data());
        } catch (e) {
            console.error("Firestore Fetch Error", e);
            return NextResponse.json({ rows: [] });
        }

        // Map local JSON structure to the array format expected by the frontend table
        // Expected: [Timestamp, Name, Dept, Email, Phone, Event, Details, RoomID, RawJSON]
        const rows: string[][] = [];

        submissions.forEach(sub => {
            const { submittedAt, user, feedbacks } = sub;
            if (!feedbacks) return;

            Object.entries(feedbacks).forEach(([eventId, feedbackData]: [string, any]) => {
                const feedbackSummary = Object.entries(feedbackData)
                    .map(([key, val]) => `${key}: ${val}`)
                    .join(" | ");

                rows.push([
                    submittedAt,
                    user.name,
                    user.department,
                    user.email || 'N/A',
                    user.phone || 'N/A',
                    eventId, // Event ID (Table expects this to act as Event Name for now)
                    feedbackSummary,
                    id,
                    JSON.stringify(feedbackData)
                ]);
            });
        });

        // Sort by timestamp descending (already sorted by Firestore, but keeping for safety if multi-event rows are mixed)
        // actually Firestore sort is per document, here we flatten, so date order might be slightly off if multiple events per sub? 
        // No, all events in one sub have same timestamp. So order is preserved.

        return NextResponse.json({ rows });

    } catch (error) {
        console.error("Feedback Fetch Error:", error);
        return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }
}
