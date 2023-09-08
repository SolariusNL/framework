import { Reportable } from "@/util/types";

export const abuseReportAuthorTransformer: Partial<Record<Reportable, string>> =
  {
    game: "author",
  };
