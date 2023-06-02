import { Transition } from "@mantine/core";
import { CSSProperties, FC, useEffect, useRef } from "react";
import clsx from "../util/clsx";

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
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const updateButtonWidth = () => {
      if (ref.current) {
        const parentWidth = (
          ref.current?.parentNode as ParentNode & { clientWidth: number }
        ).clientWidth;
        if (parentWidth) {
          ref.current.style.width = `${parentWidth}px`;
        }
      }
    };

    updateButtonWidth();
    window.addEventListener("resize", updateButtonWidth);

    return () => {
      window.removeEventListener("resize", updateButtonWidth);
    };
  }, []);

  return (
    <Transition transition="slide-up" mounted={props.mounted}>
      {(styles) => (
        <div
          style={{
            ...buttonStyle,
            ...styles,
          }}
          ref={ref}
          className={clsx(
            props.className,
            "flex justify-center items-center w-fit z-[999]"
          )}
        >
          {props.children}
        </div>
      )}
    </Transition>
  );
};

export default Floater;
