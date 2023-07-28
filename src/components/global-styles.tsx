import { Global } from "@mantine/core";
import { FC } from "react";

type GlobalStylesProps = {
  highContrast?: boolean;
  amoled?: boolean;
};

const GlobalStyles: FC<GlobalStylesProps> = ({ highContrast, amoled }) => (
  <Global
    styles={() => ({
      ...(highContrast && {
        "*": {
          filter: "invert(1) !important",
        },
      }),
      ...(amoled && {
        "body, html": {
          backgroundColor: "#000",
        },
      }),
    })}
  />
);

export default GlobalStyles;
