import { FC } from "react";
import clsx from "../util/clsx";

type DataGridItem = {
  tooltip: string;
  icon: JSX.Element;
  value: string;
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
      {items.map(({ tooltip, icon, value }) => (
        <div className="flex flex-col gap-2 items-center" key={tooltip}>
          <div className="flex items-center gap-2">
            <div className="text-gray-400 flex items-center">{icon}</div>
            <span className="text-sm text-gray-400">{tooltip}</span>
          </div>
          <span className="text-sm font-medium">{value}</span>
        </div>
      ))}
    </div>
  );
};

export default DataGrid;
