import { OperatingSystem } from "@prisma/client";
import {
  Body,
  createHandler,
  Param,
  Post,
  Req,
} from "@storyofams/next-api-decorators";
import type { NextApiRequest } from "next";
import { getClientIp } from "request-ip";
import { hashPass, isSamePass } from "../../../util/hash/password";
import { sendMail } from "../../../util/mail";
import createNotification from "../../../util/notifications";
import prisma from "../../../util/prisma";
import { RateLimitMiddleware } from "../../../util/rateLimit";
import { verificationEmail } from "../../../util/templates/verification-email";
import { getOperatingSystem, getOperatingSystemString } from "../../../util/ua";

interface LoginBody {
  username: string;
  password: string;
}

interface RegisterBody {
  inviteCode: string;
  username: string;
  password: string;
  email: string;
}

class AuthRouter {
  @Post("/login")
  @RateLimitMiddleware(2)()
  public async login(@Body() body: LoginBody, @Req() request: NextApiRequest) {
    const { username, password } = body;
    const ip = getClientIp(request);
    const os = getOperatingSystem(String(request.headers["user-agent"] || ""));

    if (!username || !password) {
      return {
        status: 400,
        message: "Username and password are required",
      };
    }

    const account = await prisma.user.findFirst({
      where: {
        username: String(username),
      },
    });

    if (!account) {
      return {
        status: 400,
        message: "Invalid username or password",
      };
    }

    if (!(await isSamePass(password, account.password))) {
      return {
        status: 400,
        message: "Invalid username or password",
      };
    }

    if (account.emailRequiredLogin) {
      const emailAuth = await prisma.emailLoginRequest.create({
        data: {
          user: {
            connect: {
              id: account.id,
            },
          },
          createdAt: new Date(),
          code:
            Array(6)
              .fill(0)
              .map(() => Math.floor(Math.random() * 10))
              .join("") + "",
        },
      });

      await createNotification(
        Number(account.id),
        "LOGIN",
        `New attempt to login to your account from a ${getOperatingSystemString(
          os
        )} device with IP ${ip}. They've been sent an email to verify their identity. If this wasn't you, you can change your password to prevent this from happening again.`,
        "New Login"
      );

      sendMail(
        account.email,
        "Login Authorization",
        `
          <h1>Verify login for ${account.username}</h1>
          <p style="margin-bottom: 25px;">
            Someone is trying to login to your account from a ${getOperatingSystemString(
              os
            )} device with IP ${ip}. If this wasn't you, you can change your password to prevent this from happening again. Your code is:
          </p>
          <h3 style="margin-bottom: 25px;">${emailAuth.code}</h3>
          <a href="${
            process.env.NODE_ENV === "production"
              ? "https://framework.soodam.rocks/verifyemail/login"
              : "http://localhost:3000/verifyemail/login"
          }/${
          emailAuth.id
        }" style="padding: 10px 15px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin-bottom: 12px;">Verify Login</a>
        `
      );

      return {
        success: true,
        requiresEmail: true,
        emailId: emailAuth.id,
      };
    }

    const session = await prisma.session.create({
      data: {
        user: {
          connect: {
            id: Number(account.id),
          },
        },
        token: Array(12)
          .fill(0)
          .map(() => Math.random().toString(36).substring(2))
          .join(""),
        ip: String(getClientIp(request)),
        ua: String(request.headers["user-agent"] || "Unknown"),
        os: OperatingSystem[
          getOperatingSystem(
            String(request.headers["user-agent"]) || ""
          ) as keyof typeof OperatingSystem
        ],
      },
    });

    if (account.notificationPreferences.includes("LOGIN")) {
      await createNotification(
        Number(account.id),
        "LOGIN",
        `New login detected from a ${getOperatingSystemString(
          os
        )} device with IP ${ip}`,
        "New Login"
      );
    }

    return {
      success: true,
      token: session.token,
    };
  }

  @Post("/register")
  @RateLimitMiddleware(5)()
  public async register(
    @Body() body: RegisterBody,
    @Req() request: NextApiRequest
  ) {
    const { inviteCode, username, password, email } = body;

    if (!inviteCode || !username || !password || !email) {
      return {
        status: 400,
        message: "All fields are required",
      };
    }

    const invite = await prisma.invite.findFirst({
      where: {
        code: String(inviteCode),
      },
    });

    if (!invite) {
      return {
        status: 400,
        message: "Invalid invite code",
      };
    }

    if (invite.used) {
      return {
        status: 400,
        message: "Invite code has already been used",
      };
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,24}$/;
    if (!usernameRegex.test(username)) {
      return {
        status: 400,
        message:
          "Username must be between 3 and 24 characters and can only contain letters, numbers, and underscores",
      };
    }

    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
      return {
        status: 400,
        message: "Invalid email",
      };
    }

    if (password.length < 3) {
      return {
        status: 400,
        message: "Password must be at least 3 characters",
      };
    }

    const userAlreadyExists = await prisma.user.findFirst({
      where: {
        OR: [{ email: String(email) }, { username: String(username) }],
      },
    });

    if (userAlreadyExists) {
      return {
        status: 400,
        message: "User already exists",
      };
    }

    const session = await prisma.session.create({
      data: {
        user: {
          create: {
            username: String(username),
            password: String(await hashPass(password)),
            email: String(email),
            avatarUri: "",
            avatar: {
              create: {},
            },
          },
        },
        token: Array(12)
          .fill(0)
          .map(() => Math.random().toString(36).substring(2))
          .join(""),
        ip: String(getClientIp(request)),
        ua: String(request.headers["user-agent"] || "Unknown"),
        os: OperatingSystem[
          getOperatingSystem(
            String(request.headers["user-agent"]) || ""
          ) as keyof typeof OperatingSystem
        ],
      },
      include: {
        user: true,
      },
    });

    await prisma.invite.update({
      where: {
        id: invite.id,
      },
      data: {
        used: true,
      },
    });

    if (process.env.MAIL_ENABLED === "true") {
      await verificationEmail(Number(session.user.id), email);
    }

    return {
      success: true,
      token: session.token,
    };
  }

  @Post("/logout")
  public async logout(@Req() request: NextApiRequest) {
    const { authorization } = request.headers;

    await prisma.session.delete({
      where: {
        token: String(authorization),
      },
    });

    return {
      finished: true,
    };
  }

  @Post("/email/:emailid/:code")
  public async emailLogin(
    @Param("emailid") emailId: string,
    @Param("code") code: string,
    @Req() request: NextApiRequest
  ) {
    const emailAuth = await prisma.emailLoginRequest.findFirst({
      where: {
        id: String(emailId),
      },
    });

    if (!emailAuth) {
      return {
        status: 400,
        message: "Invalid email login request",
      };
    }

    if (emailAuth.code !== code) {
      return {
        status: 400,
        message: "Invalid code",
      };
    }

    const session = await prisma.session.create({
      data: {
        user: {
          connect: {
            id: Number(emailAuth.userId),
          },
        },
        token: Array(12)
          .fill(0)
          .map(() => Math.random().toString(36).substring(2))
          .join(""),
        ip: String(getClientIp(request)),
        ua: String(request.headers["user-agent"] || "Unknown"),
        os: OperatingSystem[
          getOperatingSystem(
            String(request.headers["user-agent"]) || ""
          ) as keyof typeof OperatingSystem
        ],
      },
    });

    await prisma.emailLoginRequest.delete({
      where: {
        id: emailAuth.id,
      },
    });

    return {
      success: true,
      token: session.token,
    };
  }
}

export default createHandler(AuthRouter);
