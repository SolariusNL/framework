import { redisRegions } from "@/data/redis";
import IResponseBase from "@/types/api/IResponseBase";
import Authorized, { Account } from "@/util/api/authorized";
import { Fw } from "@/util/fw";
import prisma from "@/util/prisma";
import {
  RedisDatabaseType,
  type RedisDatabase,
  type User,
} from "@prisma/client";
import {
  Body,
  Get,
  Post,
  createHandler,
} from "@solariusnl/next-api-decorators";
import { z } from "zod";

export type GetRedisDatabasesResponse = IResponseBase<{
  databases: RedisDatabase[];
}>;
export type CreateRedisDatabaseResponse = IResponseBase<{
  database: RedisDatabase;
}>;

const createRedisDatabaseValidator = z
  .object({
    name: z.string().min(1).max(64),
    type: z.nativeEnum(RedisDatabaseType),
    region: z.string().refine((v) => !!redisRegions[v]),
    multiZoneReplication: z.boolean(),
  })
  .strict();

class RedisRouter {
  @Get("/databases")
  @Authorized()
  public async getRedisDatabases(@Account() user: User) {
    const dbs = await prisma.redisDatabase.findMany({
      where: {
        ownerId: user.id,
      },
    });

    return <GetRedisDatabasesResponse>{
      success: true,
      data: {
        databases: dbs,
      },
    };
  }

  @Post("/new")
  @Authorized()
  public async createRedisDatabase(
    @Account() user: User,
    @Body() body: unknown
  ) {
    const validated = createRedisDatabaseValidator.parse(body);

    const db = await prisma.redisDatabase.create({
      data: {
        name: validated.name,
        type: validated.type,
        region: validated.region,
        multiZoneReplication: validated.multiZoneReplication,
        ownerId: user.id,
        tenantPhrase: Fw.Strings.randomPhrase(),
      },
    });

    return <CreateRedisDatabaseResponse>{
      success: true,
      data: {
        database: db,
      },
    };
  }
}

export default createHandler(RedisRouter);
