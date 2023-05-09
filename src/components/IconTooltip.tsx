import { Tooltip, useMantineColorScheme } from "@mantine/core";
import { openModal } from "@mantine/modals";
import clsx from "../util/clsx";

type IconTooltipProps = {
  label: string;
  icon: JSX.Element;
  descriptiveModal?: boolean;
  descriptiveModalProps?: {
    title: string;
    children: JSX.Element;
  };
  className?: string;
};

const IconTooltip: React.FC<IconTooltipProps> = ({
  label,
  icon,
  className,
  descriptiveModal,
  descriptiveModalProps,
}) => {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Tooltip withinPortal zIndex={999999} label={label}>
      <div
        onClick={() => {
          if (descriptiveModal)
            openModal({
              title: descriptiveModalProps?.title,
              children: (
                <div className={colorScheme}>
                  {descriptiveModalProps?.children}
                </div>
              ),
            });
        }}
        className={clsx(
          "text-dimmed flex items-center",
          descriptiveModal ? "cursor-pointer" : "cursor-default",
          className
        )}
      >
        {icon}
      </div>
    </Tooltip>
  );
};

export default IconTooltip;
