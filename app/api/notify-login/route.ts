import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const { email, name } = await req.json();

        if (!email) {
            return Response.json({ error: "No email provided" }, { status: 400 });
        }

        const user = process.env.GMAIL_USER;
        const pass = process.env.GMAIL_APP_PASSWORD;

        if (!user || !pass) {
            console.warn("Gmail Credentials Missing. Could not send notification.");
            // We soft-fail so the user can still log in even if emails aren't configured
            return Response.json({ success: false, reason: "Credentials missing in .env" });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user, pass }
        });

        const time = new Date().toLocaleString('en-US', { timeZoneName: 'short' });

        const mailOptions = {
            from: `"LegalLens AI Security" <${user}>`,
            to: email, // Sending the notification to the user who just logged in
            subject: "Security Alert: New Sign-in to LegalLens AI",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #0c0c0e; text-align: center; padding: 20px;">
                        <h1 style="color: #3b82f6; margin: 0; letter-spacing: 2px;">LEGALLENS AI</h1>
                    </div>
                    <div style="padding: 30px; background-color: #f9f9f9; color: #333;">
                        <h2 style="margin-top: 0;">New Sign-In Detected</h2>
                        <p>Hi ${name || 'User'},</p>
                        <p>We're letting you know that your Google account was just used to sign in to LegalLens AI.</p>
                        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Account</td>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${email}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Time</td>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${time}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Method</td>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd;">Google Single Sign-On</td>
                            </tr>
                        </table>
                        <p>If you did not authorize this login, please change your Google password immediately to secure your account.</p>
                    </div>
                    <div style="background-color: #fff; text-align: center; padding: 15px; color: #888; font-size: 12px; border-top: 1px solid #eee;">
                        © ${new Date().getFullYear()} LegalLens AI. All rights reserved.
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return Response.json({ success: true });

    } catch (error: any) {
        console.error("Mailer Error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
