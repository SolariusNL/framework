import countries from "@/data/countries";
import IResponseBase from "@/types/api/IResponseBase";
import { AdminAuthorized } from "@/util/api/authorized";
import cast from "@/util/cast";
import fetchJson from "@/util/fetch";
import { License, LicenseKeyData, LicensePlans } from "@/util/license";
import prisma from "@/util/prisma";
import { ApplicationLicense } from "@prisma/client";
import {
  Body,
  Get,
  Param,
  Post,
  createHandler,
} from "@solariusnl/next-api-decorators";
import { z } from "zod";

const keyServer =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:3000"
    : "https://framework.solarius.me";
const generateLicenseSchema = z
  .object({
    fullName: z.string().min(1).max(100),
    email: z.string().email(),
    country: z
      .string()
      .length(2)
      .refine((value) => {
        return countries.map((country) => country.code).includes(value);
      }),
    plan: z.string().refine((value) => {
      return Object.values(LicensePlans).includes(value as LicensePlans);
    }),
  })
  .strict();
let cachedUploadedLicense: LicenseKeyData | null = null;

export type PostGenerateLicenseKeyResponse = IResponseBase<{
  license: ApplicationLicense;
}>;
export type GetExtractKeyInformationResponse = IResponseBase<{
  license: LicenseKeyData & {
    expiresAt: Date;
  };
}>;
export type PostUploadLicenseKeyResponse = IResponseBase<{
  uploadedLicense: LicenseKeyData;
}>;

class LicenseRouter {
  @AdminAuthorized()
  @Post("/generate")
  public async generateLicenseKey(@Body() body: unknown) {
    const { fullName, email, country, plan } =
      generateLicenseSchema.parse(body);

    const license = License.generateLicenseKey({
      plan: cast<LicensePlans>(plan),
      name: fullName,
      email,
      country,
    });
    const dbLicense = await prisma.applicationLicense.create({
      data: {
        data: license,
        store: {
          create: {
            expiresAt: new Date(Date.now() + 31556952000),
            store: {
              connectOrCreate: {
                where: {
                  id: 1,
                },
                create: {
                  id: 1,
                },
              },
            },
          },
        },
      },
    });

    return <PostGenerateLicenseKeyResponse>{
      success: true,
      data: {
        license: dbLicense,
      },
    };
  }

  @Get("/information/:key")
  public async extractKeyInformation(@Param("key") key: string) {
    const valid = License.validateLicenseKey(key);
    if (!valid) {
      return <GetExtractKeyInformationResponse>{
        success: false,
        message: "Invalid license key",
      };
    }

    const dbLicense = await prisma.applicationLicenseStoreEntry.findFirst({
      where: {
        license: {
          data: key,
        },
      },
    });

    if (!dbLicense) {
      return <GetExtractKeyInformationResponse>{
        success: false,
        message: "License key not found",
      };
    }

    return <GetExtractKeyInformationResponse>{
      success: true,
      data: {
        license: {
          ...License.extractKeyInformation(key)!,
          expiresAt: dbLicense?.expiresAt!,
        },
      },
    };
  }

  @Get("/validate/:key")
  public async validateLicenseKey(@Param("key") key: string) {
    const valid = License.validateLicenseKey(key);
    if (!valid) {
      return <IResponseBase>{
        success: false,
        message: "Invalid license key",
      };
    }

    return <IResponseBase>{
      success: true,
      message: "Valid license key",
    };
  }

  @Post("/upload/:key")
  @AdminAuthorized()
  public async uploadLicenseKey(@Param("key") key: string) {
    const valid = License.validateLicenseKey(key);
    if (!valid) {
      return <IResponseBase>{
        success: false,
        message: "Invalid license key",
      };
    }

    const existingKey = await prisma.uploadedLicense.findFirst();

    if (existingKey) {
      return <IResponseBase>{
        success: false,
        message: "License key already uploaded",
      };
    }

    const res = await fetchJson<GetExtractKeyInformationResponse>(
      `${keyServer}/api/license/information/${key}`
    );
    if (!res.success) {
      return <IResponseBase>{
        success: false,
        message: "Invalid license key",
      };
    }

    await prisma.uploadedLicense.create({
      data: {
        data: key,
      },
    });

    return <IResponseBase>{
      success: true,
      message: "License uploaded",
      data: {
        uploadedLicense: res.data?.license!,
      },
    };
  }

  @Get("/uploaded")
  @AdminAuthorized()
  public async getUploadedLicense() {
    const uploadedLicense = await prisma.uploadedLicense.findFirst();
    if (!uploadedLicense) {
      return <IResponseBase>{
        success: false,
        message: "No license key uploaded",
      };
    }

    if (!cachedUploadedLicense) {
      const res = await fetchJson<GetExtractKeyInformationResponse>(
        `${keyServer}/api/license/information/${uploadedLicense.data}`
      );
      if (!res.success) {
        return <IResponseBase>{
          success: false,
          message: "Invalid license key",
        };
      }

      cachedUploadedLicense = res.data?.license!;
    }

    return <IResponseBase>{
      success: true,
      data: {
        uploadedLicense: cachedUploadedLicense,
      },
    };
  }
}

export default createHandler(LicenseRouter);
