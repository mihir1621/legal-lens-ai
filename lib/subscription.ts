import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

export const PLANS = {
    free: { name: "Free", limit: 3, durationDays: 30 },
    pro: { name: "Pro", limit: 100, durationDays: 30 },
    "pro+": { name: "Pro +", limit: 300, durationDays: 180 },
    premium: { name: "Premium", limit: 999999, durationDays: 365 }, // Unlimited
};

export async function getUserSubscription(userId: string) {
    if (!userId) return null;
    
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    
    const now = new Date();
    
    if (!snap.exists()) {
        // Initialize new user with free plan
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + PLANS.free.durationDays);
        
        const initialData = {
            planType: "free",
            usageCount: 0,
            usageLimit: PLANS.free.limit,
            planStartDate: now.toISOString(),
            planEndDate: endDate.toISOString(),
        };
        
        await setDoc(userRef, initialData, { merge: true });
        return initialData;
    }
    
    const data = snap.data();
    let currentPlanBase = PLANS[data.planType as keyof typeof PLANS] || PLANS.free;
    
    // Check if plan has expired
    let planEndDate = new Date(data.planEndDate);
    if (now > planEndDate) {
        // If expired, reset to Free or renew cycle for free tier
        // For paid tiers, usually they downgrade to free if not renewed, but for now let's just 
        // reset usage and extend the date based on current plan type to avoid complex billing logic here.
        // It's safer to downgrade to Free so they have to pay again, unless they are free.
        
        let newPlanType = "free"; // Default fallback
        let newPlanBase = PLANS.free;
        
        // If they were free, just renew it.
        // If they were paid, we downgrade to free since we don't have auto-charge logic yet.
        
        const newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + newPlanBase.durationDays);
        
        const renewedData = {
            planType: newPlanType,
            usageCount: 0,
            usageLimit: newPlanBase.limit,
            planStartDate: now.toISOString(),
            planEndDate: newEndDate.toISOString(),
        };
        
        await updateDoc(userRef, renewedData);
        return { ...data, ...renewedData };
    }
    
    return data;
}

export async function incrementUsage(userId: string) {
    if (!userId) return false;
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        usageCount: increment(1)
    });
    return true;
}

export async function canAnalyze(userId: string) {
    const sub = await getUserSubscription(userId);
    if (!sub) return false;
    return sub.usageCount < sub.usageLimit;
}
