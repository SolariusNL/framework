import { configure } from "@happykit/flags/config";

const productionKey = process.env.NEXT_PUBLIC_FLAGS_PRODUCTION;
const developmentKey = process.env.NEXT_PUBLIC_FLAGS_DEVELOPMENT;

configure({
  envKey: String(
    process.env.NODE_ENV === "development" ? developmentKey : productionKey
  ),
});
