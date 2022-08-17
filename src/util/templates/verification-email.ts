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
      <h1>Verify email for ${token.user.username}</h1>
      <p style="margin-bottom: 25px;">
        Welcome to Framework. Please click the link below to verify your email.
      </p>
      <a href="${
        process.env.NODE_ENV === "production"
          ? "https://framework.soodam.rocks"
          : "http://localhost:3000"
      }/verifyemail/${token.id}">Verify Email</a>
    `
  );
};
