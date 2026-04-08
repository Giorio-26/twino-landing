import type { NextRequest } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  socialMediaUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FormData = await request.json();

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Send email to admin
    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: "twinoyc@gmail.com",
      subject: `New Demo Request: ${body.firstName} ${body.lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #0072ff;">New Demo Request</h2>
          <p><strong>Name:</strong> ${body.firstName} ${body.lastName}</p>
          <p><strong>Email:</strong> ${body.email}</p>
          <p><strong>Company:</strong> ${body.companyName || "N/A"}</p>
          <p><strong>Social Media:</strong> ${body.socialMediaUrl || "N/A"}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">This is an automated email from your TwinO landing page.</p>
        </div>
      `,
    });

    // Send confirmation email to user
    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: body.email,
      subject: "Demo Request Received - TwinO",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #0072ff;">Hi ${body.firstName},</h2>
          <p>Thanks for requesting a demo of TwinO! We've received your information and will be in touch within 24 hours.</p>
          <p>In the meantime, here's what to expect:</p>
          <ul>
            <li>A 15-minute personalized call with our team</li>
            <li>Live demo using your own leads (if available)</li>
            <li>Discussion of your specific needs and pain points</li>
          </ul>
          <p>Best regards,<br><strong>The TwinO Team</strong></p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return Response.json(
      { message: "Demo request submitted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Form submission error:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
