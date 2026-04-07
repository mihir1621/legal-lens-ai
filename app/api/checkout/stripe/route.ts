import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { amount, planName } = await req.json();

        // 1. Initialize Stripe (Fallback to dummy keys)
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
            apiVersion: "2024-12-18.acacia", // Safest recent version
        });

        // 2. We use Stripe Checkout Sessions to generate a hosted test payment page
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: `LegalLens ${planName} Plan`,
                            description: "Automated AI legal analysis subscription",
                        },
                        unit_amount: Math.round(Number(amount) * 100), // paise/cents equivalent
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            // We use the origin to beautifully redirect back into our application
            success_url: `${req.headers.get("origin")}/pricing?payment=success&plan=${planName}`,
            cancel_url: `${req.headers.get("origin")}/pricing`,
        });

        // Return the exact secure hosted URL checkout page
        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (err: any) {
        console.error("Stripe Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
