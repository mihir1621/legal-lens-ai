import { db } from "@/lib/firebase"; // Note: API routes in App Router can use the client SDK or Admin SDK. The client DB works.
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { PLANS } from "@/lib/subscription";

export async function POST(req: Request) {
    try {
        const { userId, planType } = await req.json();

        if (!userId || !planType) {
            return Response.json({ error: "Missing parameters" }, { status: 400 });
        }

        // Standardize planType format to match PLANS object keys
        const formattedPlan = planType.toLowerCase();
        let selectedPlan = PLANS[formattedPlan as keyof typeof PLANS];
        
        // Handle variations like "Pro +"
        if (!selectedPlan) {
            if (formattedPlan.includes('pro') && formattedPlan.includes('+')) {
                selectedPlan = PLANS['pro+'];
            } else {
                selectedPlan = PLANS.premium; // default to premium if it's the premium plan
            }
        }

        const userRef = doc(db, "users", userId);
        const snap = await getDoc(userRef);

        const now = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + selectedPlan.durationDays);

        const upgradeData = {
            planType: formattedPlan.includes('+') ? 'pro+' : formattedPlan,
            usageCount: 0, // Reset usage on new plan
            usageLimit: selectedPlan.limit,
            planStartDate: now.toISOString(),
            planEndDate: endDate.toISOString(),
        };

        if (snap.exists()) {
            await updateDoc(userRef, upgradeData);
        } else {
            // Should theoretically already exist from automatic creation, but just in case
            const { setDoc } = await import("firebase/firestore");
            await setDoc(userRef, upgradeData, { merge: true });
        }

        return Response.json({ success: true, newPlan: upgradeData.planType });
    } catch (error: any) {
        console.error("Upgrade API Error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
