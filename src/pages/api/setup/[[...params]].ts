import IResponseBase from "@/types/api/IResponseBase";
import { hashPass } from "@/util/hash/password";
import prisma from "@/util/prisma";
import { AdminPermission, PrismaClient } from "@prisma/client";
import {
  Body,
  Get,
  Patch,
  Post,
  UnauthorizedException,
  createHandler,
} from "@solariusnl/next-api-decorators";
import { setEnvVar } from "@soodam.re/env-utils";
import { spawn } from "child_process";
import { copyFileSync, existsSync } from "fs";
import { z } from "zod";

const checkState = async () => {
  const setup = await prisma.appConfig.findUnique({
    where: {
      id: "did-setup",
    },
  });

  if (setup?.value === "true") {
    throw new UnauthorizedException("Setup not completed");
  }
};
const schema = z.object({
  type: z.union([z.literal("string"), z.literal("manual")]),
  host: z.string().optional(),
  port: z.number().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  database: z.string().optional(),
  connectionUrl: z.string().optional(),
  driver: z.union([z.literal("mysql"), z.literal("postgresql")]).optional(),
});
const adminSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().email(),
});

const connectToDatabase = async (
  url: string,
  data: z.infer<typeof schema>
): Promise<IResponseBase> => {
  const client = new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
  });

  try {
    await client.$connect();
    await client.$disconnect();
    const prevData = await prisma.appConfig.findUnique({
      where: {
        id: "setup-data",
      },
    });

    await prisma.appConfig.update({
      where: {
        id: "setup-data",
      },
      data: {
        value: JSON.stringify({
          ...JSON.parse(prevData?.value ?? "{}"),
          1: {
            dbType: data.type,
            dbConnector: data.type === "string" ? "string" : data.driver,
            dbHost: data.host,
            dbPort: data.port,
            dbUser: data.username,
            dbPassword: data.password,
            dbName: data.database,
            connectionUrl: data.connectionUrl,
          },
        }),
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, message: "Could not connect to the database" };
  }
};

class SetupRouter {
  private async incrementStage() {
    const stage = await prisma.appConfig.findUnique({
      where: {
        id: "setup-state",
      },
    });

    await prisma.appConfig.update({
      where: {
        id: "setup-state",
      },
      data: {
        value: `${parseInt(stage?.value ?? "0") + 1}`,
      },
    });
  }

  private async decrementStage() {
    const stage = await prisma.appConfig.findUnique({
      where: {
        id: "setup-state",
      },
    });

    await prisma.appConfig.update({
      where: {
        id: "setup-state",
      },
      data: {
        value: `${parseInt(stage?.value ?? "0") - 1}`,
      },
    });
  }

  private async setupDatabase() {
    const prevData = await prisma.appConfig.findUnique({
      where: {
        id: "setup-data",
      },
    });
    const parsedData = JSON.parse(prevData?.value ?? "{}")[1];
    if (!parsedData) {
      await this.decrementStage();
    }
    const path = process.cwd() + "/.env";
    const examplePath = process.cwd() + "/.env.example";
    if (!existsSync(path)) {
      copyFileSync(examplePath, path);
    }
    setEnvVar(
      process.cwd() + "/.env",
      "DATABASE_URL",
      `"${
        parsedData.dbType === "string"
          ? parsedData.connectionUrl
          : `postgresql://"${parsedData.dbUser}:${parsedData.dbPassword}@${parsedData.dbHost}:${parsedData.dbPort}/${parsedData.dbName}"`
      }"`
    );
    const proc = spawn("yarn", ["run", "migrate"], {
      cwd: process.cwd(),
      env: process.env,
    });
    proc.stdout.on("data", (data) => {
      console.log(data.toString());
    });
    proc.stderr.on("data", (data) => {
      console.error(data.toString());
    });
    proc.on("close", async (code) => {
      if (code !== 0) {
        await this.decrementStage();
      }
      await this.incrementStage();
    });
  }

  private async setupAdmin() {
    const prevData = await prisma.appConfig.findUnique({
      where: {
        id: "setup-data",
      },
    });
    const parsedData = JSON.parse(prevData?.value ?? "{}")[2];
    if (!parsedData) {
      await this.decrementStage();
    }
    await prisma.user.create({
      data: {
        username: parsedData.username,
        password: await hashPass(parsedData.password),
        email: parsedData.email,
        role: "ADMIN",
        adminPermissions: [
          AdminPermission.CHANGE_INSTANCE_SETTINGS,
          AdminPermission.EDIT_FAST_FLAGS,
          AdminPermission.EDIT_PERMISSIONS,
          AdminPermission.GENERATE_GIFTS,
          AdminPermission.IMPERSONATE_USERS,
          AdminPermission.PUNISH_USERS,
          AdminPermission.RUN_ACTIONS,
          AdminPermission.WRITE_ARTICLE,
          AdminPermission.PROTECT_USERS
        ],
        avatarUri: "",
      },
    });
    await this.incrementStage();
  }

  private async finishSetup() {
    await prisma.appConfig.update({
      where: {
        id: "did-setup",
      },
      data: {
        value: "true",
      },
    });
  }

  @Get("/step")
  public async getStep() {
    await checkState();

    const stage = await prisma.appConfig.findUnique({
      where: {
        id: "setup-state",
      },
    });

    const step = parseInt(stage?.value ?? "0");
    if (step === 2) await this.setupDatabase();
    if (step === 4) await this.setupAdmin();
    if (step >= 5) await this.finishSetup();

    return <IResponseBase>{
      success: true,
      data: {
        step: parseInt(stage?.value ?? "0"),
      },
    };
  }

  @Patch("/increment")
  public async incrementStep() {
    await checkState();

    const stage = await prisma.appConfig.findUnique({
      where: {
        id: "setup-state",
      },
    });

    await prisma.appConfig.update({
      where: {
        id: "setup-state",
      },
      data: {
        value: `${parseInt(stage?.value ?? "0") + 1}`,
      },
    });

    const step = parseInt(stage?.value ?? "0");
    if (step === 2) await this.setupDatabase();
    if (step === 4) await this.setupAdmin();
    if (step >= 5) await this.finishSetup();

    return <IResponseBase>{
      success: true,
    };
  }

  @Patch("/decrement")
  public async decrementStep() {
    await checkState();

    const stage = await prisma.appConfig.findUnique({
      where: {
        id: "setup-state",
      },
    });

    await prisma.appConfig.update({
      where: {
        id: "setup-state",
      },
      data: {
        value: `${parseInt(stage?.value ?? "0") - 1}`,
      },
    });

    return <IResponseBase>{
      success: true,
    };
  }

  @Post("/db")
  public async setupDb(@Body() body: unknown) {
    await checkState();

    const data = schema.parse(body);
    let connectionUrl: string;

    if (data.type === "string") {
      connectionUrl = data.connectionUrl!;
    } else {
      connectionUrl = `${data.driver}://${data.username}:${data.password}@${
        data.host ?? "localhost"
      }:${data.port ?? 3306}/${data.database}`;
    }

    return connectToDatabase(connectionUrl, data);
  }

  @Post("/admin")
  public async setupAdminAccount(@Body() body: unknown) {
    await checkState();
    const data = adminSchema.parse(body);

    const prevData = await prisma.appConfig.findUnique({
      where: {
        id: "setup-data",
      },
    });

    await prisma.appConfig.update({
      where: {
        id: "setup-data",
      },
      data: {
        value: JSON.stringify({
          ...JSON.parse(prevData?.value ?? "{}"),
          2: {
            adminUsername: data.username,
            adminPassword: data.password,
            adminEmail: data.email,
          },
        }),
      },
    });

    return <IResponseBase>{
      success: true,
    };
  }
}

export default createHandler(SetupRouter);
