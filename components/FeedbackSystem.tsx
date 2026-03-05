'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, Send, CheckCircle2, MessageSquare, Sparkles } from "lucide-react";

interface FeedbackButtonProps {
    type: 'up' | 'down';
    active: boolean;
    onClick: () => void;
}

function FeedbackButton({ type, active, onClick }: FeedbackButtonProps) {
    const Icon = type === 'up' ? ThumbsUp : ThumbsDown;
    const activeColor = type === 'up' ? 'bg-primary' : 'bg-destructive';
    const hoverColor = type === 'up' ? 'hover:bg-primary/20 hover:text-primary' : 'hover:bg-destructive/10 hover:text-destructive';

    return (
        <motion.button
            whileTap={{ scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            onClick={onClick}
            className={`relative h-12 w-16 rounded-2xl flex items-center justify-center transition-colors duration-300 ${active ? `${activeColor} text-white shadow-lg` : `bg-white/5 text-muted-foreground ${hoverColor}`
                }`}
        >
            {/* Pop Animation for the Icon */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={active ? 'active' : 'inactive'}
                    initial={{ scale: 1 }}
                    animate={active ? {
                        scale: [1, 1.6, 1],
                        rotate: [0, type === 'up' ? -15 : 15, 0],
                    } : { scale: 1 }}
                    transition={{
                        duration: 0.4,
                        ease: "easeInOut"
                    }}
                >
                    <Icon className={`h-5 w-5 ${active ? 'fill-current' : ''}`} />
                </motion.div>
            </AnimatePresence>

            {/* Floating Particles (Meta-style) */}
            {active && [...Array(4)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                    animate={{
                        scale: [0, 1, 0],
                        opacity: [1, 0.8, 0],
                        x: (i % 2 === 0 ? 1 : -1) * (Math.random() * 30 + 20),
                        y: - (Math.random() * 40 + 30),
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`absolute h-2 w-2 rounded-full ${type === 'up' ? 'bg-primary' : 'bg-destructive'}`}
                />
            ))}

            {/* Subtle Outer Ring Pulse */}
            {active && (
                <motion.div
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`absolute inset-0 rounded-2xl border-2 ${type === 'up' ? 'border-primary' : 'border-destructive'}`}
                />
            )}
        </motion.button>
    );
}

export default function FeedbackSystem() {
    const [rating, setRating] = useState<'up' | 'down' | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [comment, setComment] = useState("");
    const [selectedImprovements, setSelectedImprovements] = useState<string[]>([]);

    const improvements = [
        "Simpler language",
        "Better risks",
        "New doc types",
        "Higher speed",
        "Detailed summaries"
    ];

    const toggleImprovement = (item: string) => {
        if (selectedImprovements.includes(item)) {
            setSelectedImprovements(selectedImprovements.filter(i => i !== item));
        } else {
            setSelectedImprovements([...selectedImprovements, item]);
        }
    };

    const handleSubmit = () => {
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg mx-auto p-6 rounded-2xl border border-primary/20 bg-primary/5 flex items-center gap-4"
            >
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="text-left">
                    <h3 className="text-lg font-bold">Feedback Received!</h3>
                    <p className="text-sm text-muted-foreground">Thanks for helping us grow.</p>
                </div>
            </motion.div>
        );
    }

    return (
        <section className="w-full py-12 px-4">
            <div className="container mx-auto max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative group p-6 md:p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm shadow-xl overflow-hidden"
                >
                    {/* Minimalist Glow */}
                    <div className="absolute -right-10 -top-10 h-32 w-32 bg-primary/10 blur-3xl rounded-full" />

                    <div className="relative z-10 flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-center md:text-left">
                                <h2 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    Help Us Improve
                                </h2>
                                <p className="text-xs text-muted-foreground mt-1">How was the analysis today?</p>
                            </div>

                            <div className="flex gap-3">
                                <FeedbackButton
                                    type="up"
                                    active={rating === 'up'}
                                    onClick={() => setRating('up')}
                                />
                                <FeedbackButton
                                    type="down"
                                    active={rating === 'down'}
                                    onClick={() => setRating('down')}
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {rating && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="pt-4 border-t border-white/5 space-y-5 overflow-hidden"
                                >
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-primary" />
                                            What could we do better?
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {improvements.map((item) => (
                                                <button
                                                    key={item}
                                                    onClick={() => toggleImprovement(item)}
                                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${selectedImprovements.includes(item)
                                                        ? 'bg-primary/20 border-primary text-primary'
                                                        : 'bg-white/5 border-white/10 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                                                        }`}
                                                >
                                                    {item}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold">Any other feedback or questions?</h3>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Your suggestions..."
                                            className="w-full min-h-[80px] p-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/30 resize-none"
                                        />
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        className="w-full h-11 bg-primary text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98]"
                                    >
                                        <Send className="h-4 w-4" />
                                        Submit
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
