import fs from 'fs/promises';
import path from 'path';
import { RoomConfig, RoomMetadata } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const ROOMS_DIR = path.join(DATA_DIR, 'rooms');

// Ensure directory exists
const ensureDir = async () => {
    await fs.mkdir(ROOMS_DIR, { recursive: true });
};

export async function getRoom(roomId: string): Promise<RoomConfig | null> {
    try {
        const filePath = path.join(ROOMS_DIR, `${roomId}.json`);
        console.log(`[Store] Reading room file: ${filePath}`);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error(`[Store] Failed to read room ${roomId}:`, error);
        return null;
    }
}

export async function saveRoom(config: RoomConfig): Promise<boolean> {
    try {
        await ensureDir();
        const filePath = path.join(ROOMS_DIR, `${config.id}.json`);
        await fs.writeFile(filePath, JSON.stringify(config, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error("Failed to save room:", error);
        return false;
    }
}

export async function listRooms(ownerId?: string): Promise<RoomMetadata[]> {
    try {
        await ensureDir();
        const files = await fs.readdir(ROOMS_DIR);
        const rooms: RoomMetadata[] = [];

        for (const file of files) {
            if (file.endsWith('.json')) {
                try {
                    const content = await fs.readFile(path.join(ROOMS_DIR, file), 'utf-8');
                    const config: RoomConfig = JSON.parse(content);

                    // Filter by owner if specified
                    if (ownerId) {
                        // console.log(`[Store] Checking room ${config.id} (owner: ${config.ownerId}) against requester: ${ownerId}`);
                        if (config.ownerId && config.ownerId !== ownerId) {
                            continue;
                        }
                        if (!config.ownerId && ownerId !== 'admin') {
                            continue;
                        }
                    }

                    // Ensure metadata exists, fallback if not
                    if (config.metadata) {
                        rooms.push(config.metadata);
                    } else {
                        rooms.push({
                            id: config.id || file.replace('.json', ''),
                            name: config.globalSettings?.title || "Untitled Room",
                            createdAt: new Date().toISOString(),
                            eventCount: config.events?.length || 0,
                            ownerId: config.ownerId
                        });
                    }
                } catch (e) {
                    console.error(`Error reading room file ${file}`, e);
                }
            }
        }
        // Exclude the old 'config.json' if it ended up here, but we are using a subdirectory 'rooms' now so it's safe.
        // Sort by newest first
        return rooms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
        console.error("Failed to list rooms:", error);
        return [];
    }
}

// Default template for new rooms
export const createDefaultRoom = (id: string, name: string, ownerId: string): RoomConfig => ({
    id,
    ownerId,
    metadata: {
        id,
        name,
        createdAt: new Date().toISOString(),
        eventCount: 0,
        ownerId
    },
    globalSettings: {
        title: name,
        description: "Welcome! Please select an event to provide feedback.",
        logo: ""
    },
    participantFields: {
        name: { enabled: true, required: true, label: "Full Name" },
        department: { enabled: true, required: true, label: "Department" },
        email: { enabled: true, required: false, label: "Email" },
        phone: { enabled: true, required: false, label: "Phone" }
    },
    events: []
});

