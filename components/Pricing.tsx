'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Star, Zap, Crown, User, X, Loader2, CreditCard, Landmark, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";

const PRICING_PLANS = [
    {
        name: "Free",
        originalPrice: null,
        discount: null,
        price: "₹0",
        period: "/ month",
        description: "Perfect for individuals and students starting out.",
        features: [
            "3 Analyses / month",
            "AI-Powered Legal Analysis",
            "Advanced Risk Detection",
            "Plain English Summaries",
            "Document Comparison Engine",
            "Secure, Real-Time Processing"
        ],
        buttonText: "Start Free",
        highlight: false,
        popular: false,
        icon: User,
        color: "text-slate-500",
        bg: "bg-slate-500/10"
    },
    {
        name: "Pro",
        originalPrice: "₹499",
        discount: "40% OFF",
        price: "₹299",
        period: "/ month",
        description: "For professionals needing consistent basic reviews.",
        features: [
            "100 Analyses / month",
            "AI-Powered Legal Analysis",
            "Advanced Risk Detection",
            "Plain English Summaries",
            "Document Comparison Engine",
            "Secure, Real-Time Processing",
            "Priority Processing Speed"
        ],
        buttonText: "Upgrade to Pro",
        highlight: true,
        popular: true,
        icon: Star,
        color: "text-primary",
        bg: "bg-primary/10"
    },
    {
        name: "Pro +",
        originalPrice: "₹2,699",
        discount: "45% OFF",
        price: "₹1,499",
        period: "/ 6 months",
        description: "Semi-annual access for active small teams.",
        features: [
            "300 Analyses / 6 months",
            "Everything in Pro",
            "Multi-Document Uploads",
            "Custom Clause Highlighting",
            "PDF Export Functionality",
            "Email Support"
        ],
        buttonText: "Upgrade to Pro +",
        highlight: false,
        popular: false,
        icon: Zap,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        name: "Premium",
        originalPrice: "₹11,999",
        discount: "50% OFF",
        price: "₹5,999",
        period: "/ year",
        description: "Uncapped performance for legal enterprises.",
        features: [
            "Unlimited Analyses / year",
            "Everything in Pro +",
            "Dedicated Account Manager",
            "API Access Integration",
            "Custom Branded Reports",
            "24/7 Priority Support"
        ],
        buttonText: "Go Premium",
        highlight: false,
        popular: false,
        icon: Crown,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10"
    }
];

export default function Pricing() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccessData, setPaymentSuccessData] = useState<any>(null);

    // Monitor for Stripe redirect success
    useEffect(() => {
        if (searchParams.get("payment") === "success") {
            const planToUpgrade = searchParams.get("plan");
            console.log("Stripe Payment Success for:", planToUpgrade);
            
            const unsubscribe = auth.onAuthStateChanged((user) => {
                if (user && planToUpgrade) {
                    const matchedPlan = PRICING_PLANS.find(p => p.name === planToUpgrade);
                    const mockPaymentId = "stripe_checkout_" + Math.floor(Math.random()*10000);
                    
                    fetch('/api/subscription/upgrade', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            userId: user.uid, 
                            planType: planToUpgrade,
                            amount: Number(matchedPlan?.price.replace(/[^0-9]/g, '') || 0),
                            gateway: 'Stripe',
                            paymentId: mockPaymentId
                        })
                    }).then(() => {
                        setPaymentSuccessData({
                            plan: planToUpgrade,
                            paymentId: "stripe_checkout_" + Math.floor(Math.random()*10000),
                            method: "Stripe Checkout"
                        });
                        // Remove router.push to let user click the modal button
                    });
                }
            });
            return () => unsubscribe();
        }
    }, [searchParams, router]);

    const processPayment = async (gateway: 'stripe' | 'razorpay') => {
        setIsProcessing(true);
        try {
            const rawAmount = selectedPlan.price.replace(/[^0-9]/g, '');
            if (gateway === 'stripe') {
                const res = await fetch('/api/checkout/stripe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: rawAmount, planName: selectedPlan.name })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Stripe Initialization Failed");
                if (data.url) window.location.href = data.url;
            } else {
                const loadScript = () => new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.onload = () => resolve(true);
                    script.onerror = () => resolve(false);
                    document.body.appendChild(script);
                });
                await loadScript();

                const res = await fetch('/api/checkout/razorpay', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: rawAmount, planId: selectedPlan.name })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Razorpay Initialization Failed");

                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy',
                    amount: data.amount,
                    currency: "INR",
                    name: "LegalLens AI Test Mode",
                    description: `Testing Mode Checkout: ${selectedPlan.name}`,
                    order_id: data.orderId,
                    handler: async function (response: any) {
                        try {
                            if (auth.currentUser) {
                                await fetch('/api/subscription/upgrade', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 
                                        userId: auth.currentUser.uid, 
                                        planType: selectedPlan.name,
                                        amount: rawAmount,
                                        gateway: 'Razorpay',
                                        paymentId: response.razorpay_payment_id
                                    })
                                });
                            }
                            setPaymentSuccessData({
                                plan: selectedPlan.name,
                                paymentId: response.razorpay_payment_id,
                                method: "Razorpay"
                            });
                            setSelectedPlan(null);
                        } catch (e) {
                            alert("Payment succeeded but we couldn't upgrade your tier automatically. Contact support.");
                        }
                    },
                    theme: { color: "#3b82f6" }
                };
                const rzp = new (window as any).Razorpay(options);
                rzp.open();
                
                rzp.on('payment.failed', function () {
                    setIsProcessing(false);
                });
            }
        } catch (e: any) {
            console.error(e);
            alert(`Payment System Error:\n${e.message}\n\nMake sure your test API keys (.env) are populated!`);
            setIsProcessing(false);
        }
        if(gateway === 'razorpay') {
             setIsProcessing(false);
        }
    };

    return (
        <section id="pricing" className="w-full pt-4 pb-20 md:pt-6 md:pb-28 scroll-mt-16 relative overflow-hidden bg-background/50">
            {/* Background Aesthetics */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[150px]" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Header Section */}
                <div className="text-center mb-24 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary tracking-[0.3em] uppercase mb-4 shadow-sm"
                    >
                        Transparent Pricing
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-7xl font-black tracking-tighter leading-tight"
                    >
                        Simple Plans for <br /><span className="text-primary italic font-serif">Every Scale</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium"
                    >
                        Choose the level of legal clarity that fits your workflow. From occasional checks to enterprise-scale document analysis.
                    </motion.p>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {PRICING_PLANS.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.8, type: "spring", stiffness: 100 }}
                            whileHover={{
                                scale: 1.05,
                                y: -10,
                                transition: { type: "spring", stiffness: 400, damping: 10 }
                            }}
                            className={`relative flex flex-col p-8 rounded-[3.5rem] border transition-all duration-500 group ${plan.popular
                                ? 'border-primary ring-2 ring-primary/20 bg-card shadow-2xl shadow-primary/10'
                                : 'border-border bg-card/40 backdrop-blur-xl hover:border-primary/20 hover:shadow-2xl'
                                }`}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                                    <span className="bg-primary text-white text-xs font-extrabold px-6 py-2 rounded-full tracking-wider uppercase shadow-xl shadow-primary/30 flex items-center justify-center gap-1.5 whitespace-nowrap">
                                        <Star className="h-4 w-4 fill-white" />
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            {/* Plan Header */}
                            <div className="mb-8 relative flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`h-14 w-14 shrink-0 rounded-2xl ${plan.bg} flex items-center justify-center ${plan.color} border border-white/5 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                                        <plan.icon className="h-7 w-7" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <h3 className={`text-2xl font-black tracking-tight leading-none mb-1.5 ${plan.popular ? 'text-primary' : 'text-foreground'}`}>
                                            {plan.name}
                                        </h3>
                                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest leading-tight">
                                            {plan.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 pt-2">
                                    {plan.originalPrice && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm text-muted-foreground font-bold line-through decoration-rose-500/50 decoration-[2px]">
                                                {plan.originalPrice}
                                            </span>
                                            <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-500/20 shadow-sm">
                                                <Zap className="w-3 h-3 fill-emerald-500" />
                                                {plan.discount}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-4xl font-black tracking-tighter ${plan.originalPrice ? 'text-foreground' : ''}`}>
                                            {plan.price}
                                        </span>
                                        <span className="text-sm text-muted-foreground font-bold tracking-tight">
                                            {plan.period}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Features List */}
                            <div className="flex-1 space-y-4 mb-10">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className={`mt-1 h-5 w-5 rounded-lg flex items-center justify-center shrink-0 border ${plan.popular ? 'bg-primary/20 border-primary/20 text-primary' : 'bg-muted border-border text-muted-foreground'}`}>
                                            <Check className="h-3 w-3 bold" />
                                        </div>
                                        <span className="text-[13px] font-bold text-foreground/70 leading-tight italic group-hover:text-foreground transition-colors">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Action Button */}
                            <button 
                                onClick={() => plan.price === "₹0" ? router.push('/signup') : setSelectedPlan(plan)}
                                className={`w-full py-4 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-xl ${plan.popular
                                ? 'bg-primary text-white hover:bg-orange-600 shadow-primary/25 active:scale-95'
                                : 'bg-muted hover:bg-primary hover:text-white text-foreground hover:shadow-primary/25 active:scale-95'
                                }`}>
                                {plan.buttonText}
                            </button>

                            {/* Bouncy Bubble Glow */}
                            <div className={`absolute -right-20 -bottom-20 h-40 w-40 blur-[80px] rounded-full transition-all duration-700 opacity-0 group-hover:opacity-30 ${plan.popular ? 'bg-primary' : 'bg-primary' // Changed to bg-primary to match hover color theme
                                }`} />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Payment Gateway Overlay Modal */}
            <AnimatePresence>
                {selectedPlan && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !isProcessing && setSelectedPlan(null)}
                    >
                        <motion.div
                            className="bg-[#0f0f12] border border-white/10 rounded-[2rem] p-8 max-w-md w-full relative shadow-2xl overflow-hidden"
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent pointer-events-none" />
                            
                            <button 
                                onClick={() => setSelectedPlan(null)}
                                disabled={isProcessing}
                                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <h3 className="text-2xl font-black text-white tracking-tight mb-2">Checkout Simulation</h3>
                            <p className="text-sm text-slate-400 font-medium mb-6">
                                You are testing the <span className="text-white font-bold">{selectedPlan.name} Plan</span> for <span className="text-primary font-bold">{selectedPlan.price}</span>. Select a gateway.
                            </p>

                            <div className="space-y-4 relative z-10">
                                <button 
                                    onClick={() => processPayment('stripe')}
                                    disabled={isProcessing}
                                    className="w-full bg-[#635BFF] hover:bg-[#5b54eb] text-white p-4 rounded-xl font-bold flex items-center gap-3 transition-colors disabled:opacity-50"
                                >
                                    {isProcessing && selectedPlan?.gateway === 'stripe' ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : (
                                        <>
                                            <CreditCard className="h-6 w-6" />
                                            <div className="flex-col text-left">
                                                <span className="block text-sm tracking-wide">Pay via Stripe Checkout</span>
                                                <span className="block text-[10px] text-white/70 font-medium">International simulation (Cards)</span>
                                            </div>
                                        </>
                                    )}
                                </button>
                                
                                <div className="text-center">
                                    <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">OR</span>
                                </div>

                                <button 
                                    onClick={() => processPayment('razorpay')}
                                    disabled={isProcessing}
                                    className="w-full bg-[#1E62DC] hover:bg-[#1a55c2] text-white p-4 rounded-xl font-bold flex items-center gap-3 transition-colors disabled:opacity-50"
                                >
                                    {isProcessing && selectedPlan?.gateway === 'razorpay' ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : (
                                        <>
                                            <Landmark className="h-6 w-6" />
                                            <div className="flex-col text-left">
                                                <span className="block text-sm tracking-wide">Pay via Razorpay</span>
                                                <span className="block text-[10px] text-white/70 font-medium">India simulation (UPI & Netbanking)</span>
                                            </div>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Modal */}
            <AnimatePresence>
                {paymentSuccessData && (
                    <motion.div
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-[#0c0c0e] border border-emerald-500/30 rounded-[2rem] p-8 md:p-10 max-w-md w-full relative shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden text-center"
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                            
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 10, delay: 0.1 }}
                                className="mx-auto w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 relative z-10"
                            >
                                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                            </motion.div>

                            <h3 className="text-3xl font-black text-white tracking-tight mb-2 relative z-10">Payment Successful</h3>
                            <p className="text-sm text-slate-400 font-medium mb-8 relative z-10">
                                Your account has been upgraded and is ready to use.
                            </p>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 text-left space-y-3 relative z-10">
                                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                    <span className="text-xs text-slate-500 uppercase tracking-widest font-black">Plan Tier</span>
                                    <span className="text-sm font-bold text-white">{paymentSuccessData.plan}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                    <span className="text-xs text-slate-500 uppercase tracking-widest font-black">Method</span>
                                    <span className="text-sm font-bold text-white">{paymentSuccessData.method}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500 uppercase tracking-widest font-black">Transaction ID</span>
                                    <span className="text-xs font-mono text-slate-300">{paymentSuccessData.paymentId}</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => {
                                    setPaymentSuccessData(null);
                                    router.push('/upload');
                                }}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors relative z-10 shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95"
                            >
                                Go to Dashboard <ArrowRight className="h-5 w-5" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
