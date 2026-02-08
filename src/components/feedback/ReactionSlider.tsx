"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Smile, Meh, Frown, Heart, ThumbsUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface ReactionSliderProps {
    value?: number;
    onChange: (val: number) => void;
}

const ICONS = [
    { icon: Frown, color: "text-red-500", label: "Terrible" },
    { icon: Meh, color: "text-orange-400", label: "Bad" },
    { icon: Meh, color: "text-yellow-400", label: "Okay" }, // Reusing Meh for simplicity, maybe rotate it?
    { icon: Smile, color: "text-lime-400", label: "Good" },
    { icon: Heart, color: "text-pink-500", label: "Loved it!" }, // 5 Stars
];

export function ReactionSlider({ value = 3, onChange }: ReactionSliderProps) {
    // 1-based index for value (1 to 5)
    // internal 0-based index (0 to 4)
    const [currentIndex, setCurrentIndex] = useState(value - 1);
    const containerRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const [width, setWidth] = useState(0);

    // Initialize width with ResizeObserver for robustness
    useEffect(() => {
        if (!containerRef.current) return;

        const measure = () => {
            if (containerRef.current) {
                setWidth(containerRef.current.offsetWidth);
            }
        };

        // Initial measure
        measure();

        // Observer
        const resizeObserver = new ResizeObserver(() => {
            measure();
        });

        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    // Sync external value changes
    useEffect(() => {
        setCurrentIndex(value - 1);
    }, [value]);

    // Update x position when width or index changes
    useEffect(() => {
        if (width > 0) {
            const newX = (currentIndex / 4) * width;
            animate(x, newX, { type: "spring", stiffness: 300, damping: 30 });
        }
    }, [currentIndex, width, x]);


    const handleDragEnd = () => {
        const currentX = x.get();
        // Calculate closest index
        let newIndex = Math.round((currentX / width) * 4);
        // Clamp index
        newIndex = Math.max(0, Math.min(4, newIndex));

        setCurrentIndex(newIndex);
        onChange(newIndex + 1);
    };

    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        let newIndex = Math.round((clickX / rect.width) * 4);
        newIndex = Math.max(0, Math.min(4, newIndex));

        setCurrentIndex(newIndex);
        onChange(newIndex + 1);
    };

    const CurrentIcon = ICONS[currentIndex]?.icon || Smile;
    const currentColor = ICONS[currentIndex]?.color || "text-gray-400";

    // Transform background width based on x
    const progressWidth = useTransform(x, (latest) => `${(latest / width) * 100}%`);
    // Fallback for initial render or when width is 0
    const displayWidth = width > 0 ? progressWidth : `${(currentIndex / 4) * 100}%`;

    return (
        <div className="w-full space-y-6 py-4 border border-white/5 rounded-xl p-6 bg-white/5 select-none touch-none">
            {/* Dynamic Icon */}
            <div className="flex justify-center h-16">
                <motion.div
                    key={currentIndex}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                    <CurrentIcon className={`w-12 h-12 ${currentColor}`} strokeWidth={2.5} />
                </motion.div>
            </div>

            {/* Label */}
            <div className="text-center h-6">
                <motion.span
                    key={`label-${currentIndex}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`font-bold text-lg ${currentColor}`}
                >
                    {ICONS[currentIndex]?.label}
                </motion.span>
            </div>

            {/* Slider Track */}
            <div
                className="relative h-12 w-full flex items-center cursor-pointer"
                ref={containerRef}
                onClick={handleTrackClick}
            >
                {/* Track Background */}
                <div className="absolute h-3 w-full bg-white/10 rounded-full overflow-hidden">
                    {/* Progress Fill */}
                    <motion.div
                        className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 rounded-full opacity-50"
                        style={{ width: displayWidth }}
                    />
                </div>

                {/* Drag Handle */}
                <motion.div
                    className="absolute w-8 h-8 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] border-4 border-sympo-blue cursor-grab active:cursor-grabbing z-20 flex items-center justify-center"
                    style={{ x }}
                    drag="x"
                    dragConstraints={containerRef}
                    dragElastic={0.05}
                    dragMomentum={false}
                    onDragEnd={handleDragEnd}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 1.1 }}
                >
                    <div className="w-2 h-2 bg-sympo-blue rounded-full" />
                </motion.div>

                {/* Step Markers */}
                <div className="absolute w-full flex justify-between px-1 pointer-events-none">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i <= currentIndex ? 'bg-white/50' : 'bg-white/10'}`}
                        />
                    ))}
                </div>
            </div>

            <div className="flex justify-between px-1">
                <span className="text-xs text-white/20">Not good</span>
                <span className="text-xs text-white/20">Best</span>
            </div>
        </div>
    );
}
