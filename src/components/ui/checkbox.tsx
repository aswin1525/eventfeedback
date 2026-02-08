import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, ...props }, ref) => {
        return (
            <label className="flex items-center space-x-3 cursor-pointer group select-none">
                <div className="relative">
                    <input
                        type="checkbox"
                        className="peer sr-only"
                        ref={ref}
                        {...props}
                    />
                    <div className={cn(
                        "w-6 h-6 rounded-lg glass border transition-all peer-checked:bg-sympo-orange peer-checked:border-sympo-orange flex items-center justify-center group-hover:scale-105",
                        className
                    )}>
                        <Check className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                    </div>
                </div>
                {label && <span className="text-white/80 group-hover:text-white transition-colors">{label}</span>}
            </label>
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
