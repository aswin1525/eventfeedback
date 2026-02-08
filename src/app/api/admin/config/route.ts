
import { NextResponse } from 'next/server';
import { getRoom, saveRoom, listRooms } from '@/lib/store';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const adminUser = cookieStore.get('admin_user')?.value;

        if (!adminUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fallback: Get the latest room for this user
        const rooms = await listRooms(adminUser);
        if (rooms.length === 0) {
            return NextResponse.json({ error: 'No configuration found' }, { status: 404 });
        }
        const latestRoomId = rooms[0].id; // listRooms returns sorted by newest
        const config = await getRoom(latestRoomId);

        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const adminUser = cookieStore.get('admin_user')?.value;
        if (!adminUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const newConfig = await request.json();

        // If config has ID, save it. Otherwise error.
        if (!newConfig.id) {
            return NextResponse.json({ error: 'Config must have an ID' }, { status: 400 });
        }

        // Ensure owner is preserved or set
        newConfig.ownerId = adminUser;
        newConfig.metadata.ownerId = adminUser;

        const success = await saveRoom(newConfig);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
