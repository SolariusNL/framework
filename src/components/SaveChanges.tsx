import { Button, ButtonProps, Text } from "@mantine/core";
import { FC } from "react";
import { HiInformationCircle } from "react-icons/hi";
import IconTooltip from "./IconTooltip";
import ShadedCard from "./ShadedCard";

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
      className="dark:bg-black bg-opacity-50 dark:bg-opacity-50"
      style={{
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        width: "100%",
      }}
      radius="lg"
    >
      <div className="flex justify-between items-center gap-4 w-full">
        <div className="flex items-center gap-2">
          <IconTooltip icon={<HiInformationCircle />} label="Unsaved changes" />
          <Text weight={500} color="dimmed" size="sm">
            Unsaved changes
          </Text>
          <Text color="dimmed" size="sm">
            {props.label || "You have unsaved changes!"}
          </Text>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            onClick={props.onDiscard}
          >
            Cancel
          </Button>
          <Button onClick={props.onClick} {...props.saveProps}>
            {props.children || "Save Changes"}
          </Button>
        </div>
      </div>
    </ShadedCard>
  );
};

export default SaveChanges;
