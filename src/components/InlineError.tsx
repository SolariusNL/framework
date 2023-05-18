import { Text } from "@mantine/core";
import { FC } from "react";
import { HiExclamation } from "react-icons/hi";

type InlineErrorProps = {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  children: React.ReactNode;
};

const InlineError: FC<InlineErrorProps> = ({ icon, title, children }) => {
  return (
    <div className="flex gap-2 items-start">
      <div className="flex-shrink-0 text-red-700">
        {icon ? icon : <HiExclamation />}
      </div>
      <div className="flex flex-col gap-1">
        <Text color="red" size="sm" weight={500}>
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
