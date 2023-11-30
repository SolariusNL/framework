import { UserReportState } from "@prisma/client";

const getReportStateColor = (state: UserReportState) => {
  return state === UserReportState.AWAITING_REVIEW
    ? "orange"
    : state === UserReportState.VIOLATIONS_FOUND
    ? "red"
    : state === UserReportState.NO_VIOLATIONS
    ? "green"
    : "gray";
};

const getReportStateLabel = (state: UserReportState) => {
  return state === UserReportState.AWAITING_REVIEW
    ? "Awaiting review"
    : state === UserReportState.VIOLATIONS_FOUND
    ? "Violations found"
    : state === UserReportState.NO_VIOLATIONS
    ? "No violations found"
    : "Unknown";
};

export { getReportStateColor, getReportStateLabel };
