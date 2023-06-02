import { Button, ButtonProps, Text } from "@mantine/core";
import { FC } from "react";
import ShadedCard from "./ShadedCard";
import IconTooltip from "./IconTooltip";
import { HiInformationCircle } from "react-icons/hi";

type SaveChangesProps = {
  label?: string;
  saveProps: ButtonProps;
  onClick: (onComplete: () => void) => void;
} & React.HTMLAttributes<HTMLDivElement>;

const SaveChanges: FC<SaveChangesProps> = (props) => {
  return (
    <ShadedCard
      withBorder
      p="sm"
      className="dark:bg-black bg-opacity-100"
      style={{
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <IconTooltip icon={<HiInformationCircle />} label="Unsaved changes" />
          <Text weight={500} color="dimmed">{props.label || "You have unsaved changes."}</Text>
        </div>
        <Button onClick={() => {
          props.onClick(() => {

          });
          
        }} {...props.saveProps}>{props.children || "Save Changes"}</Button>
      </div>
    </ShadedCard>
  );
};

export default SaveChanges;
