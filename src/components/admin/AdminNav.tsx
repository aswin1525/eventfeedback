"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, CalendarDays, FileQuestion, LogOut, Settings, List } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Events", href: "/admin/events", icon: CalendarDays },
    { label: "Questions", href: "/admin/questions", icon: FileQuestion },
    { label: "Responses", href: "/admin/feedback", icon: List },
];

export function AdminNav() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        document.cookie = "admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        router.push("/admin/login");
    };

    return (
        <nav className="glass border-b border-white/10 p-4 mb-6">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <span className="text-xl font-bold bg-gradient-to-r from-sympo-orange to-sympo-blue bg-clip-text text-transparent">
                        SympoAdmin
                    </span>

                    <div className="flex items-center gap-2">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link key={item.href} href={item.href}>
                                    <span className={cn(
                                        "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-white/10 text-white"
                                            : "text-white/60 hover:text-white hover:bg-white/5"
                                    )}>
                                        <Icon className="w-4 h-4 mr-2" />
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </div>
        </nav>
    );
}
