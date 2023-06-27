import { Tooltip, useMantineColorScheme } from "@mantine/core";
import { openModal } from "@mantine/modals";
import clsx from "@/util/clsx";

type IconTooltipProps = {
  label: string;
  icon: JSX.Element;
  descriptiveModal?: boolean;
  descriptiveModalProps?: {
    title: string;
    children: JSX.Element;
  };
  className?: string;
  stopPropagation?: boolean;
};

const IconTooltip: React.FC<IconTooltipProps> = ({
  label,
  icon,
  className,
  descriptiveModal,
  descriptiveModalProps,
  stopPropagation,
}) => {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Tooltip withinPortal zIndex={999999} label={label}>
      <div
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          if (stopPropagation) e.stopPropagation();
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
