import { Text } from "@mantine/core";
import { FC } from "react";
import { HiExclamation } from "react-icons/hi";
import clsx from "@/util/clsx";

type InlineErrorVariant = "error" | "warning" | "info" | "success";
type InlineErrorProps = {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: InlineErrorVariant;
};

const InlineError: FC<InlineErrorProps> = ({
  icon,
  className,
  title,
  children,
  variant = "error",
}) => {
  const variants = {
    error: "text-red-700",
    warning: "text-yellow-700",
    info: "text-sky-700",
    success: "text-teal-800",
  };

  return (
    <div className={clsx("flex gap-2 items-start", className)}>
      <div className={clsx("flex-shrink-0", variants[variant])}>
        {icon ? icon : <HiExclamation />}
      </div>
      <div className="flex flex-col gap-0">
        <Text
          color={
            variant === "error"
              ? "red"
              : variant === "warning"
              ? "yellow"
              : variant === "info"
              ? "blue"
              : variant === "success"
              ? "teal"
              : "red"
          }
          weight={500}
          style={{ lineHeight: 1.2, marginBottom: 6 }}
        >
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
