export interface Question {
    id: string;
    type: 'rating' | 'text' | 'choice' | 'reaction-slider'; // Added reaction-slider
    label: string;
    required: boolean;
    options?: string[]; // For choice type
}

export interface EventConfig {
    id: string;
    title: string;
    isActive: boolean;
    questions: Question[];
}

export interface RoomMetadata {
    id: string;
    name: string; // The user-friendly name of the room e.g. "Symposium 2024"
    createdAt: string;
    eventCount: number;
    ownerId?: string; // ID of the admin who owns this room
}

export interface ParticipantFieldConfig {
    enabled: boolean;
    required: boolean;
    label: string;
}

export interface RoomConfig {
    id: string;
    metadata: RoomMetadata;
    ownerId?: string; // Duplicated for easy access
    globalSettings: {
        title: string;
        description: string;
        logo?: string; // Changed to single logo for simplicity in wizard for now
    };
    participantFields: {
        name: ParticipantFieldConfig;
        department: ParticipantFieldConfig;
        email: ParticipantFieldConfig;
        phone: ParticipantFieldConfig;
    };
    events: EventConfig[];
}

// Deprecated but kept for backward compatibility during migration if needed
export type AppConfig = RoomConfig;

