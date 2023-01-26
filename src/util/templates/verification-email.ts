import { render } from "@react-email/render";
import Email from "../../../email/emails/verify-email";
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
    "Verify your email address",
    render(
      Email({
        username: token.user.username,
        apiLink:
          process.env.NODE_ENV === "production"
            ? "https://framework.soodam.rocks"
            : "http://localhost:3000" + "/verifyemail/" + token.id,
      }) as React.ReactElement
    )
  );
};
