import { NextResponse } from 'next/server';
import { deleteRoom } from '@/lib/store';
import { cookies } from 'next/headers';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Check auth
    const cookieStore = await cookies();
    const adminUser = cookieStore.get('admin_user')?.value;

    if (!adminUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Verify ownership if strictly needed, currently assuming any admin can delete if they have the ID.
    // In a real app, we should check if `adminUser` matches the room's `ownerId`.

    const success = await deleteRoom(id);

    if (success) {
        return NextResponse.json({ success: true });
    } else {
        return NextResponse.json({ error: "Failed to delete room" }, { status: 500 });
    }
}
