import { sendMail } from "../mail";
import prisma from "../prisma";

export const verificationEmail = async (userId: number, email: string) => {
  const token = await prisma.emailVerification.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
    },
    include: {
      user: true,
    },
  });

  sendMail(
    email,
    "Framework Email Verification",
    `
    <div style="
      width: 500px;
      margin: 0 auto;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      padding: 16px;
    ">
      <h1 style="color: #333;">Verify email for ${token.user.username}</h1>
      <p style="margin-bottom: 25px; color: #666;;"> Welcome to Framework. Please click the link below to verify your email. </p>
      <a href="${
        process.env.NODE_ENV === "production"
          ? "https://framework.soodam.rocks"
          : "http://localhost:3000"
      }/verifyemail/${token.id}" style="
        color: #0066cc;
        display: inline-block;
        text-decoration: none;
        padding: 8px 10px;
        border-radius: 12px;
        text-align: center;
    ">Verify Email</a>
    </div>
    <p style="
      margin-top: 25px;
      text-align: center;
      color: #999;
    ">Copyright © 2023 Soodam.re B.V. All rights reserved.</p>
    `
  );
};
