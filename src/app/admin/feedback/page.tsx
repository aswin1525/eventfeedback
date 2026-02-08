"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Download, Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function FeedbackViewer() {
    const [rows, setRows] = useState<string[][]>([]);
    const [filteredRows, setFilteredRows] = useState<string[][]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetch("/api/admin/feedback")
            .then(res => res.json())
            .then(data => {
                if (data.rows) {
                    setRows(data.rows);
                    setFilteredRows(data.rows);
                }
            })
            .catch(err => console.error("Failed to load feedback", err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredRows(rows);
            return;
        }
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = rows.filter(row =>
            row.some(cell => cell.toLowerCase().includes(lowerTerm))
        );
        setFilteredRows(filtered);
    }, [searchTerm, rows]);

    const handleExport = () => {
        // Simple CSV Export
        const csvContent = "data:text/csv;charset=utf-8,"
            + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "feedback_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-sympo-orange" /></div>;

    return (
        <div className="space-y-6 p-4 md:p-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Feedback Responses</h1>
                    <p className="text-white/60">View and manage participant feedback.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={handleExport} disabled={rows.length === 0}>
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2 glass p-2 rounded-xl border border-white/5 max-w-md">
                <Search className="w-5 h-5 text-white/40 ml-2" />
                <Input
                    className="border-0 bg-transparent focus-visible:ring-0 placeholder:text-white/20"
                    placeholder="Search responses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="glass rounded-xl overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-white/80">
                        <thead className="bg-white/5 text-white font-semibold uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-4">Timestamp</th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Department</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Phone</th>
                                <th className="p-4">Event</th>
                                <th className="p-4">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-white/40">
                                        No responses found.
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.map((row, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 whitespace-nowrap text-white/60 text-xs text-ellipsis overflow-hidden max-w-[150px]">
                                            {row[0]}
                                        </td>
                                        <td className="p-4 font-medium">{row[1]}</td>
                                        <td className="p-4 text-white/60">{row[2]}</td>
                                        <td className="p-4 text-white/60 max-w-[150px] truncate">{row[3]}</td>
                                        <td className="p-4 text-white/60">{row[4]}</td>
                                        <td className="p-4 font-semibold text-sympo-orange">{row[5]}</td>
                                        <td className="p-4 text-white/70 max-w-[300px] text-xs">
                                            {row[6]}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
