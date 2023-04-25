import { FC } from "react";
import clsx from "../util/clsx";

type LoadingIndicatorProps = {
  className?: string;
};

const LoadingIndicator: FC<LoadingIndicatorProps> = ({ className }) => {
  return (
    <span className={clsx(
      "loader",
      className
    )} />
  );
};

export default LoadingIndicator;