import { Body, createHandler, Post } from "@storyofams/next-api-decorators";
import { randomUUID } from "crypto";
import prisma from "../../../util/prisma";

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
  public async login(@Body() body: LoginBody) {
    const { username, password } = body;
    if (!username || !password) {
      return {
        status: 400,
        message: "Username and password are required",
      };
    }

    const account = await prisma.user.findFirst({
      where: {
        username: String(username),
        password: String(password),
      },
    });

    if (!account) {
      return {
        status: 400,
        message: "Invalid username or password",
      };
    }

    const session = await prisma.session.create({
      data: {
        user: {
          connect: {
            id: Number(account.id),
          },
        },
        token: Math.random().toString(36).substring(2),
      },
    });

    return {
      success: true,
      token: session.token,
    };
  }

  @Post("/register")
  public async register(@Body() body: RegisterBody) {
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
            password: String(password),
            email: String(email),
            avatarUri: "",
            avatar: {
              create: {},
            },
          },
        },
        token: Math.random().toString(36).substring(2),
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

    return {
      success: true,
      token: session.token,
    };
  }
}

export default createHandler(AuthRouter);
