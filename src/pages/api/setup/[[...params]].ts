import IResponseBase from "@/types/api/IResponseBase";
import prisma from "@/util/prisma";
import { PrismaClient } from "@prisma/client";
import {
  Body,
  Get,
  Patch,
  Post,
  UnauthorizedException,
  createHandler,
} from "@storyofams/next-api-decorators";
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
    // save last valid connection url
    /**type: AppConfigUnionType.OBJECT,
    key: "setupData",
    value: JSON.stringify({
      1: {
        dbType: "", // manual | string
        dbConnector: "", // postgres | mysql
        dbHost: "",
        dbPort: 5432,
        dbUser: "",
        dbPassword: "",
        dbName: "",
      },
    }), */
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
  @Get("/step")
  public async getStep() {
    await checkState();

    const stage = await prisma.appConfig.findUnique({
      where: {
        id: "setup-state",
      },
    });

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
}

export default createHandler(SetupRouter);
