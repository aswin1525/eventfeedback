
import { NextResponse } from 'next/server';
import { getSheetData } from '@/lib/sheets';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const { db } = await import('@/lib/firebase');

        // Simple aggregation
        const stats = {
            totalSubmissions: 0,
            eventBreakdown: {} as Record<string, { count: number, totalRating: number }>
        };

        // Fetch from Firestore
        let submissions: any[] = [];
        try {
            const snapshot = await db.collection('rooms').doc(id).collection('submissions').get();
            submissions = snapshot.docs.map(doc => doc.data());
        } catch (e) {
            console.error("Firestore Stats Fetch Error", e);
        }

        if (submissions.length > 0) {
            stats.totalSubmissions = submissions.length;
            submissions.forEach(sub => {
                if (!sub.feedbacks) return;

                Object.entries(sub.feedbacks).forEach(([eventId, feedbackData]: [string, any]) => {
                    if (!stats.eventBreakdown[eventId]) {
                        stats.eventBreakdown[eventId] = { count: 0, totalRating: 0 };
                    }
                    stats.eventBreakdown[eventId].count++;

                    // Calculate average rating for this event submission
                    // Assumes feedbackData values can be numbers (ratings)
                    const ratings = Object.values(feedbackData).filter((v): v is number => typeof v === 'number' && v >= 1 && v <= 5);
                    if (ratings.length > 0) {
                        const subAvg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
                        stats.eventBreakdown[eventId].totalRating += subAvg;
                    }
                });
            });
        } else {
            // Fallback to Sheets if Firestore empty? Or just return empty.
            // Given "connect to firebase" request, we assume migration or fresh start.
            // We can keep the sheets fallback if desired, but user asked to "optimise". 
            // Mixing data sources is not optimal. Let's stick to Firestore.
        }

        // Format for recharts
        const chartData = Object.entries(stats.eventBreakdown).map(([eventId, data]) => ({
            name: eventId, // In real app, we would map ID to Title using config
            count: data.count,
            rating: data.count > 0 ? (data.totalRating / data.count).toFixed(1) : 0
        }));

        return NextResponse.json({
            summary: {
                totalSubmissions: stats.totalSubmissions,
                averageRating: chartData.length > 0
                    ? (chartData.reduce((acc, curr) => acc + Number(curr.rating), 0) / chartData.length).toFixed(1)
                    : 0
            },
            events: chartData
        });

    } catch (error) {
        console.error("Stats Error:", error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
