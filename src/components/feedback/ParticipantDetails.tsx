"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const participantSchema = z.object({
    name: z.string().min(2, "Name is required"),
    department: z.string().min(2, "Department/College is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
});

export type ParticipantData = z.infer<typeof participantSchema>;

import { ParticipantFieldConfig } from "@/types";

interface ParticipantDetailsProps {
    initialData?: ParticipantData;
    onNext: (data: ParticipantData) => void;
    fields?: Record<string, ParticipantFieldConfig>;
}

export function ParticipantDetails({ initialData, onNext, fields }: ParticipantDetailsProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ParticipantData>({
        resolver: zodResolver(participantSchema),
        defaultValues: initialData || {
            name: "",
            department: "",
            email: "",
            phone: "",
        },
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Example Info</h2>
                <p className="text-white/60">Let's get to know you first.</p>
            </div>

            <form onSubmit={handleSubmit(onNext)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" {...register("name")} placeholder="John Doe" />
                    {errors.name && <p className="text-red-400 text-sm">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="department">Department / College *</Label>
                    <Input id="department" {...register("department")} placeholder="CSE, XYZ Col..." />
                    {errors.department && <p className="text-red-400 text-sm">{errors.department.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input id="email" type="email" {...register("email")} placeholder="john@example.com" />
                        {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <Input id="phone" type="tel" {...register("phone")} placeholder="+91 98765..." />
                    </div>
                </div>

                <div className="pt-4">
                    <Button type="submit" className="w-full" isLoading={isSubmitting}>
                        Next Step
                    </Button>
                </div>
            </form>
        </div>
    );
}
