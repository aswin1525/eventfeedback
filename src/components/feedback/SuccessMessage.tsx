import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";


export function SuccessMessage() {
    return (
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-6 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">Thank You!</h2>
                <p className="text-white/60 text-lg">
                    Your feedback has been submitted successfully.
                </p>
            </div>

            <div className="pt-8">
                <Link href="/">
                    <Button variant="glass" className="w-full">
                        Return Home
                    </Button>
                </Link>
            </div>
        </div>
    );
}
