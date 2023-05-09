import { ReturnedFastFlag } from "../stores/useFastFlags";
import prisma from "./prisma";

const getServerFlags = async () => {
  const flags = await prisma.fastFlag.findMany();
  const returnedFlags: ReturnedFastFlag | any = {} as ReturnedFastFlag;
  for (const flag of flags) {
    switch (flag.valueType) {
      case "STRING":
        returnedFlags[flag.name] = flag.value as string;
        break;
      case "NUMBER":
        returnedFlags[flag.name] = Number(flag.value);
        break;
      case "BOOLEAN":
        returnedFlags[flag.name] = flag.value === "true" ? true : false;
        break;
      case "ARRAY":
        returnedFlags[flag.name] = JSON.parse(flag.value as string);
        break;
      case "OBJECT":
        returnedFlags[flag.name] = JSON.parse(flag.value as string);
        break;
    }
  }

  return returnedFlags;
};

export default getServerFlags;
