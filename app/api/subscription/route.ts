import { getUserSubscription } from "@/lib/subscription";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
        return Response.json({ error: "Missing userId" }, { status: 400 });
    }

    try {
        const sub = await getUserSubscription(userId);
        return Response.json({ subscription: sub });
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
