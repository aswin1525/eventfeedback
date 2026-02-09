import { NextResponse } from 'next/server';
import { listRooms, saveRoom } from '@/lib/store';
import { createDefaultRoom } from '@/lib/utils';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const adminUser = cookieStore.get('admin_user')?.value;

    if (!adminUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rooms = await listRooms(adminUser);
    return NextResponse.json(rooms);
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const adminUser = cookieStore.get('admin_user')?.value;

        if (!adminUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
        const newRoom = createDefaultRoom(id, name, adminUser);

        const success = await saveRoom(newRoom);

        if (success) {
            console.log(`[API] Room created: ${id} for owner: ${adminUser}`);
            return NextResponse.json({ id });
        } else {
            return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
