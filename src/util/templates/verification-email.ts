import { sendMail } from "@/util/mail";
import prisma from "@/util/prisma";
import { render } from "@react-email/render";
import Email from "email/emails/verify-email";

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

  sendMail({
    to: email,
    subject: "Verify your email address",
    html: render(
      Email({
        username: token.user.username,
        apiLink:
          process.env.NODE_ENV === "production"
            ? "https://framework.solarius.me" + "/verifyemail/" + token.id
            : "http://localhost:3000" + "/verifyemail/" + token.id,
      }) as React.ReactElement
    ),
  });
};
