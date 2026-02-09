import { db } from '@/lib/firebase';
import { RoomConfig, RoomMetadata } from '@/types';

// Collection References
const ROOMS_COLLECTION = 'rooms';

export async function getRoom(roomId: string): Promise<RoomConfig | null> {
    try {
        const doc = await db.collection(ROOMS_COLLECTION).doc(roomId).get();
        if (!doc.exists) {
            console.log(`[Store] Room ${roomId} not found in Firestore.`);
            return null;
        }
        return doc.data() as RoomConfig;
    } catch (error) {
        console.error(`[Store] Failed to fetch room ${roomId}:`, error);
        return null;
    }
}

export async function saveRoom(config: RoomConfig): Promise<boolean> {
    try {
        // Ensure metadata is up to date in the root document for easier querying
        // We use set with merge: true to update existing fields or create new ones
        await db.collection(ROOMS_COLLECTION).doc(config.id).set(config, { merge: true });
        return true;
    } catch (error) {
        console.error("Failed to save room:", error);
        return false;
    }
}

export async function listRooms(ownerId?: string): Promise<RoomMetadata[]> {
    try {
        let query: FirebaseFirestore.Query = db.collection(ROOMS_COLLECTION);

        if (ownerId && ownerId !== 'admin') {
            query = query.where('ownerId', '==', ownerId);
        }

        const snapshot = await query.get();
        const rooms: RoomMetadata[] = [];

        snapshot.forEach(doc => {
            const data = doc.data() as RoomConfig;
            if (data.metadata) {
                rooms.push(data.metadata);
            } else {
                // Fallback for migration if metadata missing
                rooms.push({
                    id: data.id,
                    name: data.globalSettings?.title || "Untitled Room",
                    createdAt: new Date().toISOString(), // Warning: This might be wrong for old data without metadata
                    eventCount: data.events?.length || 0,
                    ownerId: data.ownerId
                });
            }
        });

        // Sort by newest first (client-side sort for now to avoid index requirements)
        return rooms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
        console.error("Failed to list rooms:", error);
        return [];
    }
}
