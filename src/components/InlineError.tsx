import { Text } from "@mantine/core";
import { FC } from "react";
import { HiExclamation } from "react-icons/hi";
import clsx from "../util/clsx";

type InlineErrorProps = {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

const InlineError: FC<InlineErrorProps> = ({
  icon,
  className,
  title,
  children,
}) => {
  return (
    <div className={clsx("flex gap-2 items-start", className)}>
      <div className="flex-shrink-0 text-red-700">
        {icon ? icon : <HiExclamation />}
      </div>
      <div className="flex flex-col gap-0">
        <Text color="red" weight={500}>
          {title ? title : "Error"}
        </Text>
        <Text color="dimmed" size="sm">
          {children}
        </Text>
      </div>
    </div>
  );
};

export default InlineError;
