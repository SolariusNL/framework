import { FC } from "react";
import clsx from "@/util/clsx";

type DotProps = {
  pulse?: boolean;
  classNames?: {
    pulsar?: string;
    dot?: string;
  };
  color?: Color;
  light?: boolean;
};

const bgVariants: Record<string, string> = {
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  sky: "bg-sky-500",
  gray: "bg-gray-500",
};
const lightBgVariants: Record<string, string> = {
  green: "bg-green-500/50",
  red: "bg-red-500/50",
  yellow: "bg-yellow-500/50",
  blue: "bg-blue-500/50",
  purple: "bg-purple-500/50",
  pink: "bg-pink-500/50",
  sky: "bg-sky-500/50",
  gray: "bg-gray-500/50",
};
type Color =
  | "green"
  | "red"
  | "yellow"
  | "blue"
  | "purple"
  | "pink"
  | "sky"
  | "gray";

const Dot: FC<DotProps> = ({
  pulse = false,
  classNames,
  color = "green",
  light,
}) => {
  const Pulsar: FC<{ children: JSX.Element; color: Color }> = ({
    children,
    color,
  }) => {
    return (
      <div className="relative flex h-3 w-3 items-center justify-center">
        <div
          className={clsx(
            "w-3 h-3 rounded-full",
            bgVariants[color],
            classNames?.pulsar,
            "animate-[issue-ping_1s_cubic-bezier(0,_0,_0.2,_1)_infinite] absolute"
          )}
        />
        {children}
      </div>
    );
  };

  const Dot: FC<{ color: string }> = ({ color }) => {
    return (
      <div
        className={clsx(
          "w-3 h-3 rounded-full",
          light ? lightBgVariants[color] : bgVariants[color],
          classNames?.dot
        )}
      />
    );
  };

  return pulse ? (
    <Pulsar color={color}>
      <Dot color={color} />
    </Pulsar>
  ) : (
    <Dot color={color} />
  );
};

export default Dot;
