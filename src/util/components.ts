import getAmoledState from "@/stores/useAmoled";
import {
  AlertStylesParams,
  ButtonStylesParams,
  CSSObject,
  MantineTheme,
  NavLinkStylesParams,
  PaginationStylesParams,
  TabsStylesParams,
  TooltipStylesParams,
} from "@mantine/core";
import { AMOLED_COLORS } from "./constants";

type ThemeComponent = {
  defaultProps?: Record<string, any>;
  classNames?: Record<string, string>;
  styles?:
    | Record<string, CSSObject>
    | ((theme: MantineTheme, params: any) => Record<string, CSSObject>);
};

const getAmoled = () => {
  const { enabled: amoled } = getAmoledState();
  return amoled;
};

const components = () => {
  const amoled = getAmoled();

  return {
    Button: {
      styles: (theme: MantineTheme, params: ButtonStylesParams) => ({
        root: {
          ...(params.variant === "filled" && {
            border: "1px solid",
            borderColor:
              theme.colors[params.color || theme.primaryColor][
                theme.colorScheme == "dark" ? 2 : 9
              ] + "50",
            "&:hover": {
              borderColor:
                theme.colors[params.color || theme.primaryColor][
                  theme.colorScheme == "dark" ? 2 : 9
                ] + "50",
            },
            boxShadow:
              theme.colorScheme === "light"
                ? "inset 0 1.2px 0 0 hsla(0,0%,100%,.2);"
                : "inset 0 1px 0 rgba(255, 255, 255, 0.1);",
          }),
          ...(params.variant === "light" && {
            border: "1px solid",
            borderColor:
              theme.colors[params.color || theme.primaryColor][
                theme.colorScheme == "dark" ? 2 : 9
              ] + "15",
            "&:hover": {
              borderColor:
                theme.colors[params.color || theme.primaryColor][
                  theme.colorScheme == "dark" ? 2 : 9
                ] + "20",
            },
          }),
          ...(amoled &&
            params.variant === "default" && {
              backgroundColor: "#000 !important",
            }),
        },
      }),
    },
    NavLink: {
      styles: (theme: MantineTheme, params: NavLinkStylesParams) => ({
        root: {
          border: "1px solid",
          borderColor: "transparent",
          "&[data-active]": {
            borderColor:
              theme.colors[params.color || theme.primaryColor][
                theme.colorScheme == "dark" ? 2 : 9
              ] + "40",
            "&:hover": {
              borderColor:
                theme.colors[params.color || theme.primaryColor][
                  theme.colorScheme == "dark" ? 2 : 9
                ] + "50",
            },
          },
          "&:hover": {
            ...(amoled && {
              backgroundColor: AMOLED_COLORS.paper,
            }),
          },
        },
      }),
    },
    Avatar: {
      classNames: {
        root: "border-solid border-[0.5px] border-gray-200 dark:border-gray-100/30",
      },
    },
    Tabs: {
      styles: (theme: MantineTheme, params: TabsStylesParams) => ({
        tab: {
          "&[data-active]": {
            fontWeight: 700,
          },
          ...(params.variant === "default" && {
            "&[data-active=true]": {
              fontWeight: "normal"
            }
          })
        },
      }),
    },
    Menu: {
      styles: (theme: MantineTheme) => ({
        dropdown: {
          ...(amoled && {
            backgroundColor: "#000",
          }),
        },
        item: {
          borderRadius: "0.30rem",
        },
      }),
    },
    Modal: {
      styles: () => ({
        root: {
          zIndex: 1000,
        },
        modal: {
          ...(amoled && {
            backgroundColor: AMOLED_COLORS.paper,
          }),
        },
      }),
    },
    Notification: {
      styles: (theme: MantineTheme) => ({
        root: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      }),
    },
    Alert: {
      styles: (theme: MantineTheme, params: AlertStylesParams) => ({
        root: {
          border: "1px solid",
          borderColor:
            theme.colorScheme === "dark"
              ? theme.colors[params.color || theme.primaryColor][2] + "65"
              : theme.colors[params.color || theme.primaryColor][9] + "90",
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors[params.color || theme.primaryColor][8] + "20"
              : theme.colors[params.color || theme.primaryColor][0] + "90",
        },
        message: {
          color:
            theme.colorScheme === "dark"
              ? theme.colors[params.color || theme.primaryColor][1]
              : theme.colors[params.color || theme.primaryColor][9],
        },
      }),
    },
    Input: {
      styles: {
        input: {
          ...(amoled && {
            backgroundColor: "#000",
          }),
        },
      },
    },
    Pagination: {
      styles: (theme: MantineTheme, params: PaginationStylesParams) => ({
        item: {
          fontFamily: "Inter var",
          "&[data-active]": {
            backgroundColor:
              theme.colors[params.color || theme.primaryColor][
                theme.colorScheme === "dark" ? 8 : 0
              ] + "80",
            border:
              "1px solid " +
              theme.colors[params.color || theme.primaryColor][6],
            color:
              theme.colors[params.color || theme.primaryColor][
                theme.colorScheme === "dark" ? 2 : 9
              ],
          },
          ...(amoled && {
            backgroundColor: "#000",
          }),
        },
      }),
    },
    Anchor: {
      styles: {
        root: {
          pointerEvents: "all",
        },
      },
    },
    Select: {
      styles: (theme: MantineTheme) => ({
        item: {
          borderRadius: "0.30rem",
          "&[data-hovered]": {
            ...(amoled && {
              backgroundColor: AMOLED_COLORS.paper,
            }),
          },
          "&[data-selected]": {
            "&, &:hover": {
              ...(amoled && {
                backgroundColor: AMOLED_COLORS.paper,
                fontWeight: "bold",
              }),
            },
          },
        },
        dropdown: {
          borderRadius: theme.radius.md + " !important",
          ...(amoled && {
            backgroundColor: "#000",
          }),
        },
      }),
    },
    Tooltip: {
      styles: (theme: MantineTheme, params: TooltipStylesParams) => ({
        tooltip: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.gray[3]
              : theme.colors.dark[8],
          color:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[3],
        },
      }),
    },
    Checkbox: {
      styles: () => ({
        input: {
          ...(amoled && {
            backgroundColor: "#000",
          }),
        },
      }),
    },
    Table: {
      styles: () => ({
        root: {
          ...(amoled && {
            "&[data-striped] tbody tr:nth-of-type(odd)": {
              backgroundColor: AMOLED_COLORS.paper,
            },
          }),
        },
      }),
    },
    Accordion: {
      styles: () => ({
        control: {
          ...(amoled && {
            "&:hover": {
              backgroundColor: AMOLED_COLORS.paper + " !important",
            },
          }),
        },
      }),
    },
  } as Record<string, ThemeComponent>;
};

export default components;
