"use client"

import * as React from "react"
import { Moon, Sun, Cloud, Star } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="w-14 h-7 rounded-full bg-muted/20" /> // Placeholder
    }

    const isDark = resolvedTheme === "dark"

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark")
    }

    return (
        <button
            onClick={toggleTheme}
            className={`
                relative flex h-7 w-14 cursor-pointer items-center rounded-full p-1 shadow-inner transition-colors duration-500 overflow-hidden
                ${isDark ? 'bg-[#0f172a]' : 'bg-[#60a5fa]'} 
            `}
            // Dark: Slate 900 (Night Sky) | Light: Blue 400 (Day Sky)
            aria-label="Toggle Theme"
        >
            {/* --- Scenery Background Elements --- */}

            {/* Stars (Dark Mode) */}
            <motion.div
                className="absolute inset-0 z-0"
                initial={false}
                animate={{ opacity: isDark ? 1 : 0, y: isDark ? 0 : 10 }}
                transition={{ duration: 0.4 }}
            >
                <Star className="absolute top-1.5 left-7 h-1 w-1 text-white fill-white opacity-80" />
                <Star className="absolute bottom-1.5 left-9 h-0.5 w-0.5 text-white fill-white opacity-60" />
                <Star className="absolute top-2.5 left-10 h-1.5 w-1.5 text-white fill-white opacity-90" />
            </motion.div>

            {/* Clouds (Light Mode) */}
            <motion.div
                className="absolute inset-0 z-0"
                initial={false}
                animate={{ opacity: isDark ? 0 : 1, x: isDark ? -10 : 0 }}
                transition={{ duration: 0.4 }}
            >
                <Cloud className="absolute top-1 left-7 h-2.5 w-2.5 text-white fill-white opacity-80" />
                <Cloud className="absolute bottom-1 left-9 h-3 w-3 text-white fill-white opacity-90" />
                <Cloud className="absolute top-1.5 left-2 h-1.5 w-1.5 text-white fill-white opacity-60" />
            </motion.div>

            {/* --- Sliding Thumb --- */}
            <motion.div
                className="z-10 flex h-5 w-5 items-center justify-center rounded-full shadow-lg"
                initial={false}
                animate={{
                    x: isDark ? 28 : 0,
                    backgroundColor: isDark ? "#f1f5f9" : "#fbbf24", // Moon: Slate 100 | Sun: Amber 400
                    boxShadow: isDark
                        ? "0 0 8px 1px rgba(255, 255, 255, 0.3)" // Moon Glow
                        : "0 0 8px 1px rgba(251, 191, 36, 0.5)" // Sun Glow
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {/* Icon Switch with Rotation & Scale */}
                <AnimatePresence mode="wait">
                    {isDark ? (
                        <motion.div
                            key="moon"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Moon className="h-3 w-3 text-slate-700 fill-slate-700" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sun"
                            initial={{ scale: 0, rotate: 90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: -90 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Sun className="h-3 w-3 text-white fill-white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </button>
    )
}
