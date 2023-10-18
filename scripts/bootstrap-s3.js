console.log("S3 (MinIO) bootstrapper");
console.log("Starting...");

const dotenv = require("dotenv");
const { Client } = require("minio");
const { z } = require("zod");

dotenv.config();

const change = "CHANGE_ME";
const envSchema = z.object({
  MINIO_ENDPOINT: z
    .string()
    .min(3)
    .refine((v) => v !== change),
  MINIO_ACCESS_KEY: z
    .string()
    .min(3)
    .refine((v) => v !== change),
  MINIO_SECRET_KEY: z
    .string()
    .min(3)
    .refine((v) => v !== change),
  MINIO_USE_SSL: z.boolean(),
  MINIO_REGION: z.string().min(3).optional(),
});

const env = envSchema.parse(
  Object.fromEntries(
    Object.entries(process.env).map(([k, v]) => [k, v === "true" ? true : v])
  )
);

const client = new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_USE_SSL ? 443 : 80,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
  region: env.MINIO_REGION,
});

const buckets = [
  "avatars",
  "thumbnails",
  "icons",
  "gamepasses",
  "teams",
  "conversations",
  "assets",
  "sounds",
];

async function main() {
  for (const bucket of buckets) {
    const exists = await client.bucketExists(bucket);
    if (!exists) {
      console.log(`Creating bucket ${bucket}`);
      await client.makeBucket(bucket, env.MINIO_REGION);
    } else
      console.log(`Bucket ${bucket} already exists. Skipping creation step.`);
  }
}

main();
