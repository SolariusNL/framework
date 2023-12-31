import IconTooltip from "@/components/icon-tooltip";
import ShadedCard from "@/components/shaded-card";
import { Button, ButtonProps, Text } from "@mantine/core";
import { FC } from "react";
import { HiInformationCircle } from "react-icons/hi";

type SaveChangesProps = {
  label?: string;
  saveProps: ButtonProps;
  onClick: () => void;
  onDiscard?: () => void;
} & React.HTMLAttributes<HTMLDivElement>;

const SaveChanges: FC<SaveChangesProps> = (props) => {
  return (
    <ShadedCard
      withBorder
      p="sm"
      className="dark:bg-black bg-opacity-50 mx-4 dark:bg-opacity-50"
      style={{
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        width: "100%",
      }}
      radius="lg"
    >
      <div className="flex md:flex-row flex-col justify-between items-center gap-4 w-full">
        <div className="flex items-center gap-2">
          <div className="md:flex hidden items-center gap-2">
            <IconTooltip
              icon={<HiInformationCircle />}
              label="Unsaved changes"
            />
            <Text weight={500} color="dimmed" size="sm">
              Unsaved changes
            </Text>
          </div>
          <Text color="dimmed" size="sm">
            {props.label || "You have unsaved changes!"}
          </Text>
        </div>
        <div className="flex gap-2 items-center">
          {props.onDiscard && (
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              onClick={props.onDiscard}
            >
              Cancel
            </Button>
          )}
          <Button onClick={props.onClick} {...props.saveProps}>
            {props.children || "Save Changes"}
          </Button>
        </div>
      </div>
    </ShadedCard>
  );
};

export default SaveChanges;
