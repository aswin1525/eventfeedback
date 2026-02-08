
import { NextResponse } from 'next/server';
import { getSheetData } from '@/lib/sheets';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const fs = require('fs').promises;
        const path = require('path');
        const dataDir = path.join(process.cwd(), 'data/rooms');
        // Clean ID
        const cleanId = id.replace(/[^a-zA-Z0-9-_]/g, '');
        const feedbackFile = path.join(dataDir, `${cleanId}_feedback.json`);

        let submissions: any[] = [];
        let fromLocal = false;

        try {
            const fileContent = await fs.readFile(feedbackFile, 'utf-8');
            submissions = JSON.parse(fileContent);
            fromLocal = true;
        } catch (e) {
            // console.log("No local feedback file found, falling back to Sheets if configured.");
        }

        // Simple aggregation
        const stats = {
            totalSubmissions: 0,
            eventBreakdown: {} as Record<string, { count: number, totalRating: number }>
        };

        if (fromLocal) {
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
            const rows = await getSheetData();
            const roomRows = rows.filter((row: any[]) => row[7] === id);
            stats.totalSubmissions = roomRows.length;

            roomRows.forEach((row: any[]) => {
                const eventId = row[5];
                const rawJson = row[8];

                if (!stats.eventBreakdown[eventId]) {
                    stats.eventBreakdown[eventId] = { count: 0, totalRating: 0 };
                }
                stats.eventBreakdown[eventId].count++;

                try {
                    const data = JSON.parse(rawJson);
                    const ratings = Object.values(data).filter((v): v is number => typeof v === 'number' && v >= 1 && v <= 5);
                    if (ratings.length > 0) {
                        const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
                        stats.eventBreakdown[eventId].totalRating += avg;
                    }
                } catch (e) { }
            });
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
