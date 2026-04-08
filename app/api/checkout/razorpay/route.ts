import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { amount, planId } = await req.json();

        // 1. Initialize Razorpay (Fallback to dummy keys so the app doesn't crash if env isn't set)
        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy",
            key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
        });

        // 2. Map exact payment structures
        const options = {
            amount: Math.round(Number(amount) * 100), // Razorpay expects "paise" (1 INR = 100 paise)
            currency: "INR",
            receipt: `receipt_${Date.now()}_${planId}`,
            payment_capture: 1 // Auto-capture payments
        };

        // 3. Create the order
        const order = await razorpay.orders.create(options);
        return NextResponse.json({ orderId: order.id, amount: options.amount });
    } catch (err: any) {
        console.error("Razorpay Error:", err);
        const errorMessage = err?.error?.description || err?.message || JSON.stringify(err);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
