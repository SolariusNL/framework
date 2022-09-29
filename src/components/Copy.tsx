import { ActionIcon, CopyButton, Tooltip } from "@mantine/core";
import { HiCheck, HiClipboardCopy } from "react-icons/hi";

interface CopyProps {
  value: string | number;
}

const Copy = ({ value }: CopyProps) => {
  return (
    <CopyButton value={String(value)} timeout={2000}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? "Copied" : "Copy"} withArrow position="right">
          <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
            {copied ? <HiCheck size={16} /> : <HiClipboardCopy size={16} />}
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButton>
  );
};

export default Copy;
