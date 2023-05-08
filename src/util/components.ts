import {
  AlertStylesParams,
  BadgeStylesParams,
  ButtonStylesParams,
  MantineTheme,
  NavLinkStylesParams,
  PaginationStylesParams,
  TooltipStylesParams,
} from "@mantine/core";
import { AMOLED_COLORS } from "./constants";

const getComponents = (amoled: boolean) =>
  ({
    Button: {
      styles: (theme, params: ButtonStylesParams) => ({
        root: {
          ...(params.variant === "filled" && {
            border: "1px solid",
            borderColor:
              theme.colors[params.color || theme.primaryColor][
                theme.colorScheme == "dark" ? 2 : 9
              ] + "85",
            "&:hover": {
              borderColor:
                theme.colors[params.color || theme.primaryColor][
                  theme.colorScheme == "dark" ? 2 : 9
                ] + "85",
            },
            boxShadow:
              theme.colorScheme === "light"
                ? "inset 0 1.2px 0 0 hsla(0,0%,100%,.2);"
                : "",
          }),
          ...(amoled &&
            params.variant === "default" && {
              backgroundColor: "#000 !important",
            }),
        },
      }),
    },
    NavLink: {
      styles: (theme, params: NavLinkStylesParams) => ({
        root: {
          border: "1px solid",
          borderColor: "transparent",
          "&[data-active]": {
            borderColor:
              theme.colors[params.color || theme.primaryColor][
                theme.colorScheme == "dark" ? 2 : 9
              ] + "85",
            "&:hover": {
              borderColor:
                theme.colors[params.color || theme.primaryColor][
                  theme.colorScheme == "dark" ? 2 : 9
                ] + "85",
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
    Tabs: {
      styles: () => ({
        tab: {
          "&[data-active]": {
            fontWeight: 700,
          },
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
    Badge: {
      styles: (theme: MantineTheme, params: BadgeStylesParams) => ({
        root: {
          border: "1px solid",
          borderColor:
            theme.colors[params.color || theme.primaryColor][
              theme.colorScheme === "dark" ? 2 : 9
            ] + "90",
        },
      }),
    },
    Select: {
      styles: (theme: MantineTheme) => ({
        item: {
          borderRadius: theme.radius.md,
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
  } as MantineTheme["components"]);

export default getComponents;
