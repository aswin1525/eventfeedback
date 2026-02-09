import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { RoomConfig } from "@/types";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
