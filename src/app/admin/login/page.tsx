"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Rocket, ArrowRight, LayoutGrid } from "lucide-react";

export default function AdminLogin() {
    const [mode, setMode] = useState<'login' | 'create'>('login');
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Simple validation
        if (!username.trim()) {
            setError("Workspace name is required");
            return;
        }

        // Mock Password Logic (Keep existing simple check or allow setup)
        // For 'create', we could accept any password or just skip it.
        // For 'login', we expect 'admin123'.
        // To strictly follow user request "ask login or create", let's behave differently.

        if (password !== "admin123") {
            setError("Invalid password (use 'admin123')");
            return;
        }

        // Set Cookies
        const user = username.trim();
        document.cookie = `admin_auth=true; path=/; max-age=31536000`;
        document.cookie = `admin_user=${user}; path=/; max-age=31536000`;

        router.push("/");
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-slate-950 overflow-hidden -z-10">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-sympo-orange/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-sympo-blue/10 rounded-full blur-[100px]" />
            </div>

            <div className="glass-card w-full max-w-md p-8 animate-in fade-in zoom-in duration-500 relative overflow-hidden">
                {/* Mode Toggles */}
                <div className="flex bg-white/5 p-1 rounded-lg mb-8 relative z-10">
                    <button
                        onClick={() => setMode('login')}
                        className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${mode === 'login' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/60'
                            }`}
                    >
                        <Lock className="w-4 h-4 mr-2" />
                        Access Workspace
                    </button>
                    <button
                        onClick={() => setMode('create')}
                        className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${mode === 'create' ? 'bg-sympo-orange/20 text-sympo-orange shadow-lg' : 'text-white/40 hover:text-white/60'
                            }`}
                    >
                        <Rocket className="w-4 h-4 mr-2" />
                        New Space
                    </button>
                </div>

                <div className="text-center mb-8">
                    <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-4 transition-colors ${mode === 'login' ? 'bg-sympo-blue/20 text-sympo-blue' : 'bg-sympo-orange/20 text-sympo-orange'
                        }`}>
                        {mode === 'login' ? <LayoutGrid className="w-6 h-6" /> : <Rocket className="w-6 h-6" />}
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        {mode === 'login' ? 'Welcome Back' : 'Start Fresh'}
                    </h1>
                    <p className="text-white/50 text-sm">
                        {mode === 'login'
                            ? 'Enter your workspace name to access your rooms.'
                            : 'Create a dedicated workspace for your events.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-white/80">
                            {mode === 'login' ? 'Workspace Name' : 'New Workspace Name'}
                        </Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="e.g. engineering-team"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-sympo-orange/50 transition-colors"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-white/80">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="To protect your workspace"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-sympo-orange/50 transition-colors"
                        />
                        <p className="text-xs text-white/30 text-right">Demo: use 'admin123'</p>
                    </div>

                    {error && <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded border border-red-500/20">{error}</p>}

                    <Button
                        type="submit"
                        className={`w-full transition-all ${mode === 'create' ? 'bg-sympo-orange hover:bg-sympo-orange/90' : ''
                            }`}
                        variant="primary"
                    >
                        {mode === 'login' ? 'Enter Workspace' : 'Create & Launch'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
