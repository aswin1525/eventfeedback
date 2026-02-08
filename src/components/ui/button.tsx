import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "glass" | "ghost" | "outline";
    size?: "default" | "sm" | "lg" | "icon";
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "default", isLoading, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={isLoading || props.disabled}
                className={cn(
                    "relative inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
                    // Sizes
                    size === "default" && "px-6 py-3",
                    size === "sm" && "px-3 py-1.5 text-sm",
                    size === "lg" && "px-8 py-4 text-lg",
                    size === "icon" && "h-10 w-10",
                    // Variants
                    variant === "primary" && "bg-gradient-to-br from-sympo-orange to-orange-700 text-white shadow-lg shadow-sympo-orange/30 hover:shadow-sympo-orange/50 hover:scale-[1.02] active:scale-[0.98]",
                    variant === "glass" && "glass hover:bg-white/10 text-white hover:scale-[1.02] active:scale-[0.98]",
                    variant === "secondary" && "bg-sympo-blue text-white shadow-lg shadow-sympo-blue/30 hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98]",
                    variant === "ghost" && "hover:bg-white/5 text-white/70 hover:text-white",
                    variant === "outline" && "border border-white/10 hover:bg-white/5 text-white",
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };

