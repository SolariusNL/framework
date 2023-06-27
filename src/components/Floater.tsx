import { Transition } from "@mantine/core";
import React, { CSSProperties, FC } from "react";
import clsx from "@/util/clsx";

type FloaterProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  mounted: boolean;
};

const Floater: FC<FloaterProps> = (props) => {
  const buttonStyle: CSSProperties = {
    position: "fixed",
    bottom: "20px",
    ...props.style,
  };

  return (
    <div className="flex w-full items-center justify-center">
      <Transition transition="slide-up" mounted={props.mounted}>
        {(styles) => (
          <div
            style={{
              ...buttonStyle,
              ...styles,
            }}
            className={clsx(
              props.className,
              "flex justify-center items-center z-[999] w-fit ml-auto mr-auto"
            )}
          >
            {props.children}
          </div>
        )}
      </Transition>
    </div>
  );
};

export default Floater;
