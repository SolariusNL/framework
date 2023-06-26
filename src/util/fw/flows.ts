import { Router } from "next/router";
import { Flow } from "../../stores/useFlow";

export const Flows = {
  toggleFlow: (flow: Flow, router: Pick<Router, "asPath" | "push">) => {
    router.push(
      `${router.asPath}${router.asPath.includes("?") ? "&" : "?"}flow=${flow}`,
      undefined,
      { shallow: true }
    );
  },
};
