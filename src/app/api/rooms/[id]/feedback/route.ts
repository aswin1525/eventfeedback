import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const fs = require('fs').promises;
        const path = require('path');
        const dataDir = path.join(process.cwd(), 'data/rooms');
        const cleanId = id.replace(/[^a-zA-Z0-9-_]/g, '');
        const feedbackFile = path.join(dataDir, `${cleanId}_feedback.json`);

        let submissions: any[] = [];
        try {
            const fileContent = await fs.readFile(feedbackFile, 'utf-8');
            submissions = JSON.parse(fileContent);
        } catch (e) {
            // File not found or empty
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

        // Sort by timestamp descending
        rows.sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

        return NextResponse.json({ rows });

    } catch (error) {
        console.error("Feedback Fetch Error:", error);
        return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }
}
