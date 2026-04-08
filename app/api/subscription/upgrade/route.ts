import { db } from "@/lib/firebase";
import { doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { PLANS } from "@/lib/subscription";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, planType, amount, gateway, paymentId } = body;

        console.log("[Upgrade API] Received upgrade request:", { userId, planType, gateway });

        if (!userId || !planType) {
            return Response.json({ error: "Missing parameters" }, { status: 400 });
        }

        // Standardize planType format to match PLANS object keys
        const formattedPlan = planType.toLowerCase();
        let selectedPlan = PLANS[formattedPlan as keyof typeof PLANS];
        
        // Handle variations like "Pro +" or "Pro+"
        if (!selectedPlan) {
            if (formattedPlan.includes('pro') && formattedPlan.includes('+')) {
                selectedPlan = PLANS['pro+'];
            } else {
                // Iterative search for matching plan
                const foundKey = Object.keys(PLANS).find(k => k.toLowerCase() === formattedPlan.replace(/\s+/g, ''));
                selectedPlan = foundKey ? PLANS[foundKey as keyof typeof PLANS] : PLANS.premium;
            }
        }

        const userRef = doc(db, "users", userId);
        const now = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + selectedPlan.durationDays);

        const upgradeData = {
            planType: selectedPlan.name.toLowerCase().replace(/\s+/g, ''),
            usageCount: 0, 
            usageLimit: selectedPlan.limit,
            planStartDate: now.toISOString(),
            planEndDate: endDate.toISOString(),
            lastUpgradeAt: serverTimestamp(),
        };

        // 1. Upgrade User Plan - Atomic Merge (Bypasses read-restrictions)
        await setDoc(userRef, upgradeData, { merge: true });

        // 2. record in Revenue Ledger if payment info is present
        let revenueRecorded = false;
        if (paymentId) {
            // Ensure amount is a clean number
            const finalAmount = Number(String(amount || 0).replace(/[^0-9.]/g, ''));
            
            await addDoc(collection(db, "payments"), {
                userId,
                planType: selectedPlan.name,
                amount: finalAmount,
                currency: "INR",
                gateway: gateway || 'Unknown',
                paymentId: paymentId,
                status: 'succeeded',
                createdAt: now.toISOString(), // Keep string for consistent query if needed
                serverCreatedAt: serverTimestamp() // For backup/internal ordering
            });
            revenueRecorded = true;
            console.log("[Upgrade API] Revenue record created in 'payments' collection");
        }

        return Response.json({ 
            success: true, 
            newPlan: upgradeData.planType,
            revenueRecorded: revenueRecorded 
        });
    } catch (error: any) {
        console.error("[Upgrade API] Critical Error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
