import clsx from "@/util/clsx";
import { Text, Tooltip } from "@mantine/core";
import { FC } from "react";
import { HiInformationCircle } from "react-icons/hi";

type DataGridItem = {
  tooltip: string;
  icon: JSX.Element;
  value: string | React.ReactNode;
  hoverTip?: string;
};

type DataGridProps = {
  items: DataGridItem[];
  mdCols?: number;
  smCols?: number;
  defaultCols?: number;
  className?: string;
};

const DataGrid: FC<DataGridProps> = ({
  items,
  mdCols = 3,
  smCols = 2,
  defaultCols = 1,
  className,
}) => {
  const gridCols = `grid-cols-${defaultCols} sm:grid-cols-${smCols} md:grid-cols-${mdCols}`;

  return (
    <div className={clsx(`grid ${gridCols} gap-3 gap-y-6 mt-6`, className)}>
      {items.map(({ tooltip, icon, value, hoverTip }, i) => (
        <div className={clsx("flex flex-col gap-2 items-center")} key={tooltip}>
          <div className="flex items-center gap-2">
            <div className="text-dimmed flex items-center">{icon}</div>
            <Text color="dimmed" className="text-sm">
              {tooltip}
            </Text>
            {hoverTip && (
              <Tooltip label={hoverTip}>
                <div className="flex justify-center text-mantine-text/50 dark:text-mantine-text-dark/50">
                  <HiInformationCircle />
                </div>
              </Tooltip>
            )}
          </div>
          <span
            className={clsx("text-sm font-medium")}
            style={{
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default DataGrid;
