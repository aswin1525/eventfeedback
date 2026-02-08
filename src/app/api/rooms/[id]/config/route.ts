import { NextResponse } from 'next/server';
import { getRoom, saveRoom } from '@/lib/store';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        console.log(`API [GET] /rooms/${id}/config - Request received`);

        const room = await getRoom(id);
        console.log(`API [GET] /rooms/${id}/config - Room found:`, !!room);

        if (!room) {
            console.log(`API [GET] /rooms/${id}/config - 404 Room not found`);
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }
        return NextResponse.json(room);
    } catch (error) {
        console.error("Config Fetch Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const body = await request.json();

        // Ensure ID matches path
        if (body.id !== id) {
            return NextResponse.json({ error: "ID mismatch" }, { status: 400 });
        }

        // PRESERVE OWNER ID LOGIC
        // 1. Get existing room to find current owner
        const existingRoom = await getRoom(id);

        // 2. If existing room has owner, ensure we keep it
        if (existingRoom?.ownerId) {
            body.ownerId = existingRoom.ownerId;
            if (body.metadata) {
                body.metadata.ownerId = existingRoom.ownerId;
            }
        } else {
            // 3. Fallback: If no owner on file, but user is logged in, claim it? 
            // Ideally we shouldn't change ownership implicitly here, but for "orphaned" rooms during this migration it might be helpful.
            // For now, let's just strictly PRESERVE existing.
        }

        const success = await saveRoom(body);
        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: "Failed to save" }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }
}
