import IconTooltip from "@/components/IconTooltip";
import clsx from "@/util/clsx";
import { Text, Title } from "@mantine/core";
import { FC } from "react";
import { HiBadgeCheck } from "react-icons/hi";

type VerifiedProps = React.HTMLAttributes<HTMLDivElement>;

const Verified: FC<VerifiedProps> = ({ className, ...props }) => {
  return (
    <IconTooltip
      label="Verified"
      icon={
        <HiBadgeCheck className={clsx("text-sky-500 w-6 h-6", className)} />
      }
      descriptiveModal
      stopPropagation
      descriptiveModalProps={{
        title: "Verified",
        children: (
          <div className="text-center items-center flex flex-col">
            <HiBadgeCheck className="text-sky-500 w-16 h-16" />
            <Title order={3} mt="lg">
              Verified
            </Title>
            <Text size="sm" color="dimmed" mt="md">
              This user is verified.
            </Text>
          </div>
        ),
      }}
    />
  );
};

export default Verified;
