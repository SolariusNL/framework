import { FC } from "react";
import clsx from "@/util/clsx";

type LoadingIndicatorProps = {
  className?: string;
};

const LoadingIndicator: FC<LoadingIndicatorProps> = ({ className }) => {
  return (
    <svg
      className={clsx("ring", className)}
      viewBox="25 25 50 50"
      strokeWidth="5"
    >
      <circle cx="50" cy="50" r="20" />
    </svg>
  );
};

export default LoadingIndicator;
