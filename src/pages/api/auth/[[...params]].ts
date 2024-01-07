import IResponseBase from "@/types/api/IResponseBase";
import Authorized, { Account } from "@/util/api/authorized";
import cast from "@/util/cast";
import { hashPass, isSamePass } from "@/util/hash/password";
import { sendMail } from "@/util/mail";
import createNotification from "@/util/notifications";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";
import { RateLimitMiddleware } from "@/util/rate-limit";
import { getServerConfig } from "@/util/server-config";
import { verificationEmail } from "@/util/templates/verification-email";
import { disableOTP, generateOTP, verifyOTP } from "@/util/twofa";
import {
  getOperatingSystem,
  getOperatingSystemEnumFromString,
  getOperatingSystemString,
} from "@/util/ua";
import { NotificationType, OperatingSystem, Role } from "@prisma/client";
import { render } from "@react-email/render";
import {
  Body,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  createHandler,
} from "@solariusnl/next-api-decorators";
import { setCookie } from "cookies-next";
import AccountUpdate from "email/emails/account-update";
import LoginCode from "email/emails/login-code";
import ResetPassword from "email/emails/reset-password";
import type { NextApiRequest, NextApiResponse } from "next";
import { getClientIp } from "request-ip";
import { z } from "zod";

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

const serverConfig = getServerConfig();

class AuthRouter {
  @Post("/login")
  @RateLimitMiddleware(10)()
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

    const isEmail = username.includes("@");
    if (
      isEmail &&
      !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
        username
      )
    ) {
      return {
        status: 400,
        message: "Invalid email",
      };
    }

    const account = await prisma.user.findFirst({
      where: {
        OR: [
          {
            username: username,
          },
          {
            email: username,
          },
        ],
      },
    });

    if (!account) {
      return {
        status: 400,
        message: "Invalid credentials",
      };
    }

    if (!(await isSamePass(password, account.password))) {
      return {
        status: 400,
        message: "Invalid credentials",
      };
    }

    if (account.locked) {
      return {
        status: 403,
        message:
          "Your account has been locked. Please contact support for further assistance.",
      };
    }

    if (
      account.role === Role.ADMIN &&
      serverConfig.components["admin-sso"].enabled
    ) {
      const state = Array(12)
        .fill(0)
        .map(() => Math.random().toString(36).substring(2))
        .join("");
      return {
        success: true,
        ssoRequired: true,
        url: serverConfig.components["admin-sso"].sso.authorizationUrl,
        clientId: serverConfig.components["admin-sso"].sso.clientId,
        redirectUri: serverConfig.components["admin-sso"].sso.callbackUrl,
        state,
      };
    }

    if (account.emailRequiredLogin && !account.otpEnabled) {
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
      await prisma.newLogin.create({
        data: {
          user: {
            connect: {
              id: account.id,
            },
          },
          ip: String(ip),
          device: getOperatingSystemEnumFromString(os),
          completed: false,
        },
      });

      sendMail({
        to: account.email,
        subject: "Login Authorization",
        html: render(
          LoginCode({
            username: account.username,
            os: getOperatingSystemString(os),
            ip: String(ip),
            code: String(emailAuth.code),
            url: `${
              process.env.NODE_ENV === "production"
                ? "https://framework.solarius.me/verifyemail/login"
                : "http://localhost:3000/verifyemail/login"
            }/${emailAuth.id}`,
          }) as React.ReactElement
        ),
      });

      return {
        success: true,
        requiresEmail: true,
        emailId: emailAuth.id,
      };
    }

    if (account.otpEnabled) {
      return {
        success: true,
        otp: true,
        uid: account.id,
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
      await prisma.newLogin.create({
        data: {
          user: {
            connect: {
              id: account.id,
            },
          },
          ip: String(ip),
          device: getOperatingSystemEnumFromString(os),
          session: {
            connect: {
              id: session.id,
            },
          },
          completed: true,
        },
      });
    }

    return {
      success: true,
      token: session.token,
    };
  }

  @Get("/sso-callback")
  public async adminSsoCallback(
    @Query("code") code: string,
    @Req() request: NextApiRequest,
    @Res() response: NextApiResponse
  ) {
    const { clientId, clientSecret, callbackUrl, tokenUrl, userInfoUrl } =
      serverConfig.components["admin-sso"].sso;

    const body = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl,
    };

    const res = await fetch(tokenUrl, {
      method: "POST",
      body: new URLSearchParams(body),
    });

    const json = await res.json();

    if (!json.access_token) {
      return {
        status: 400,
        message: "Invalid code",
      };
    }

    const userRes = await fetch(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${json.access_token}`,
      },
    });

    const userJson = await userRes.json();

    if (!userJson.fw_uid) {
      return {
        status: 400,
        message:
          "Either the user doesn't exist, or you haven't been added to the Framework organization. Please contact HR for help.",
      };
    }

    const uid = cast<number>(userJson.fw_uid);

    const account = await prisma.user.findUnique({
      where: {
        id: uid,
      },
    });

    if (!account) {
      return {
        status: 400,
        message: "Invalid user",
      };
    }

    if (account.locked) {
      return {
        status: 403,
        message:
          "Your account has been locked. Please contact support for further assistance.",
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

    setCookie(".frameworksession", session.token, {
      maxAge: 60 * 60 * 24 * 30,
      ...(process.env.NEXT_PUBLIC_COOKIE_DOMAIN &&
        process.env.NEXT_PUBLIC_COOKIE_DOMAIN !== "CHANGE_ME" && {
          domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
        }),
      req: request,
      res: response,
    });

    response.redirect("/");
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
        OR: [
          { email: String(email) },
          { username: String(username) },
          {
            previousUsernames: {
              has: String(username),
            },
          },
        ],
      },
    });

    if (userAlreadyExists) {
      return {
        status: 400,
        message: "User already exists, or username has been taken",
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
            tickets: 50,
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

    createNotification(
      session.user.id,
      NotificationType.INFO,
      "Welcome to Framework! We hope you enjoy your stay! Framework was built with the goal of being a free, open source game platform for people to share their creations with the world.",
      "Welcome!"
    );

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

  @Post("/@me/twofa/disable")
  @Authorized()
  public async disableTwofa(@Account() user: User) {
    await disableOTP(user.id);
    sendMail({
      to: user.email,
      subject: "Two-Factor Authentication Disabled",
      html: render(
        AccountUpdate({
          content:
            "Two-Factor Authentication has been disabled on your account. If this was not you, please contact support immediately, and attempt to secure your account while you wait for a response.",
        }) as React.ReactElement
      ),
    });
  }

  @Post("/@me/twofa/request")
  @Authorized()
  public async requestTwofa(@Account() user: User) {
    try {
      const { base32, otpauth_url } = await generateOTP(user.id);
      return {
        base32,
        otpauth_url,
      };
    } catch (e) {
      console.log(e);
      return {
        status: 500,
        message: "Failed to generate OTP",
        success: false,
      };
    }
  }

  @Post("/@me/twofa/verify")
  public async verifyTwofa(
    @Body()
    { code, uid, intent }: { code: string; uid: number; intent: string },
    @Req() request: NextApiRequest
  ) {
    const exists = await prisma.user.findUnique({
      where: {
        id: Number(uid),
      },
    });

    if (!exists) {
      return {
        status: 400,
        message: "Invalid user",
        success: false,
      };
    }

    try {
      const verified = await verifyOTP(uid, String(code));
      if (!verified) {
        return {
          status: 400,
          message: "Invalid code",
          success: false,
        };
      }
      let session;
      if (intent === "login") {
        session = await prisma.session.create({
          data: {
            user: {
              connect: {
                id: Number(uid),
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
      }
      if (intent !== "login") {
        sendMail({
          to: session?.user?.email!,
          subject: "Two-Factor Authentication Enabled",
          html: render(
            AccountUpdate({
              content:
                "Two-Factor Authentication has been enabled on your account. If this was not you, please contact support immediately, and attempt to secure your account while you wait for a response.",
            }) as React.ReactElement
          ),
        });
      }
      return {
        success: true,
        ...(intent === "login" && { token: session?.token }),
      };
    } catch (e) {
      console.log(e);
      return {
        status: 500,
        message: "Failed to verify OTP",
        success: false,
      };
    }
  }

  @Post("/loginqr/generate")
  @Authorized()
  public async generateLoginQR(@Account() user: User) {
    await prisma.loginQR.deleteMany({
      where: {
        userId: user.id,
      },
    });

    const code = await prisma.loginQR.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
      },
      select: {
        code: true,
      },
    });

    return { code: code.code };
  }

  @Get("/loginqr/verify/:code")
  public async verifyLoginQR(
    @Param("code") code: string,
    @Req() request: NextApiRequest,
    @Res() response: NextApiResponse
  ) {
    const qr = await prisma.loginQR.findFirst({
      where: {
        code: String(code),
      },
      include: {
        user: true,
      },
    });

    if (!qr) {
      return {
        status: 400,
        message: "Invalid QR code",
      };
    }

    const ip = getClientIp(request);
    const os = getOperatingSystem(String(request.headers["user-agent"] || ""));

    await prisma.loginQR.delete({
      where: {
        code: String(code),
      },
    });

    const session = await prisma.session.create({
      data: {
        user: {
          connect: {
            id: Number(qr.userId),
          },
        },
        token: Array(12)
          .fill(0)
          .map(() => Math.random().toString(36).substring(2))
          .join(""),
        ip: String(ip),
        ua: String(request.headers["user-agent"] || "Unknown"),
        os: OperatingSystem[os as keyof typeof OperatingSystem],
      },
      include: {
        user: true,
      },
    });

    setCookie(".frameworksession", session.token, {
      maxAge: 60 * 60 * 24 * 7,
      req: request,
      res: response,
    });

    createNotification(
      session.user.id,
      NotificationType.LOGIN,
      `Your account was logged in from ${ip} on a ${os} device. If this wasn't you, change your password immediately and reset your sessions.`,
      "QR Login"
    );

    response.redirect("/");
    response.end();
  }

  @Post("/forgotpassword")
  @RateLimitMiddleware(5)()
  public async forgotPassword(@Body() body: unknown) {
    const data = z
      .object({
        email: z.string().email(),
      })
      .parse(body);

    const user = await prisma.user.findFirst({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      return {
        success: true,
      };
    }

    const request = await prisma.passwordResetRequest.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    const url =
      process.env.NODE_ENV === "production"
        ? "https://framework.solarius.me"
        : "http://127.0.0.1:3000";
    const endpoint = url + "/forgotpassword?token=" + request.id;

    sendMail({
      to: user.email,
      subject: "Password Reset Request",
      html: render(
        ResetPassword({
          username: user.username,
          url: endpoint,
        }) as React.ReactElement
      ),
    });

    return {
      success: true,
    };
  }

  @Post("/forgotpassword/auth")
  @RateLimitMiddleware(5)()
  public async forgotPasswordAuth(@Body() body: unknown) {
    const data = z
      .object({
        token: z.string(),
        password: z.string(),
      })
      .parse(body);

    const request = await prisma.passwordResetRequest.findFirst({
      where: {
        id: data.token,
      },
      include: {
        user: true,
      },
    });

    if (!request) {
      return {
        status: 400,
        message: "Invalid token",
        success: false,
      };
    }

    await prisma.passwordResetRequest.delete({
      where: {
        id: data.token,
      },
    });

    const hash = await hashPass(data.password);

    await prisma.user.update({
      where: {
        id: request.user?.id,
      },
      data: {
        password: hash,
      },
    });

    sendMail({
      to: request.user?.email!,
      subject: "Password Reset",
      html: render(
        AccountUpdate({
          content:
            "Your Framework password has been reset. If this was not you, please contact support immediately, and attempt to secure your account while you wait for a response.",
        }) as React.ReactElement
      ),
    });

    return {
      success: true,
    };
  }

  @Get("/logins")
  @Authorized()
  public async getLogins(@Account() user: User) {
    const logins = await prisma.newLogin.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        session: true,
      },
    });

    return <IResponseBase>{
      success: true,
      data: {
        logins,
      },
    };
  }
}

export default createHandler(AuthRouter);
