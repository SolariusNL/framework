import { Flow } from "@/stores/useFlow";
import { Router } from "next/router";

export const Flows = {
  toggleFlow: (
    flow: Flow,
    router: Pick<Router, "asPath" | "push">,
    params?: Record<string, unknown>
  ) => {
    router.push(
      `${router.asPath}${router.asPath.includes("?") ? "&" : "?"}flow=${flow}${
        params
          ? `&${Object.entries(params)
              .map(([key, value]) => `${key}=${value}`)
              .join("&")}`
          : ""
      }`,
      undefined,
      { shallow: true }
    );
  },
};
