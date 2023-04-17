import { Body, Post, createHandler } from "@storyofams/next-api-decorators";
import { randomUUID } from "crypto";
import { z } from "zod";
import Authorized, { Account } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";
import { promises } from "node:dns";
import { DomainStatus } from "@prisma/client";

const domainSchema = z.object({
  domain: z
    .string()
    .regex(/^[^.]+\.[^.]+$/)
    .refine(
      (domain) => {
        if (!domain) {
          return false;
        }

        return domain.split(".").length > 2;
      },
      { message: "Expected domain with subdomain" }
    ),
});

class DomainRouter {
  @Post("/create")
  @Authorized()
  public async createNewDomain(@Account() user: User, @Body() body: unknown) {
    const data = domainSchema.safeParse(body);

    if (data.success) {
      const { domain } = data.data;
      const id = randomUUID();

      const existing = await prisma.domain.findFirst({
        where: {
          domain,
        },
      });

      if (existing) {
        return {
          success: false,
          message: "Domain already exists.",
        };
      }

      await prisma.domain.create({
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
          domain,
          txtRecord: id,
        },
      });

      return {
        success: true,
        data: {
          record: `fw-verification=${id}`,
        },
      };
    } else {
      return {
        success: false,
        message: data.error,
      };
    }
  }

  @Post("/verify")
  @Authorized()
  public async verifyDomainTxtRecord(
    @Account() user: User,
    @Body() body: unknown
  ) {
    const data = domainSchema.safeParse(body);

    if (data.success) {
      const { domain } = data.data;
      const match = await prisma.domain.findFirst({
        where: {
          user: {
            id: user.id,
          },
          domain,
        },
      });

      if (!match) {
        return {
          success: false,
          message: "No domain found",
        };
      }

      const txtRecordsOnDomain = await promises.resolveTxt(domain);

      if (
        !txtRecordsOnDomain
          .flat()
          .includes(`fw-verification=${match.txtRecord}`)
      ) {
        return {
          success: false,
          message: "TXT record does not match",
        };
      } else {
        await prisma.domain.update({
          where: {
            id: match.id,
          },
          data: {
            status: DomainStatus.GENERATING_CERTIFICATE,
          },
        });
      }
    } else {
      return {
        success: false,
        message: data.error,
      };
    }
  }
}

export default createHandler(DomainRouter);
