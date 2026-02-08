"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Validation handled by middleware
        setIsAuthenticated(true);
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-sympo-orange" />
            </div>
        );
    }

    // If on login page, render children (the login form)
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    // Protected Content
    return isAuthenticated ? (
        <div className="min-h-screen bg-slate-950">
            {/* Admin Navigation */}
            <AdminNav />
            <div className="container mx-auto">
                {children}
            </div>
        </div>
    ) : null;
}

