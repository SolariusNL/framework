import { Group, Tabs, Text, useMantineTheme } from "@mantine/core";

interface TabNavTabProps {
  icon?: React.ReactNode;
}

const TabNav = (props: React.ComponentProps<typeof Tabs>) => {
  const theme = useMantineTheme();

  return (
    <Tabs
      defaultValue={props.defaultValue}
      variant="pills"
      mb={props.mb || 12}
      {...props}
      styles={{
        tab: {
          fontSize: "14px",
          marginLeft: "8px",
          transition: "background 33.333ms linear 0s",
          color:
            theme.colorScheme == "dark"
              ? "rgb(201, 209, 217)"
              : "rgb(36, 41, 47)",
          cursor: "pointer",
          padding: "6px 14px",
          /**
           * TS doesn't like this, but it works
           */
          /** @ts-ignore */
          "&[data-active=true]": {
            ":after": {
              height: "24px",
              content: "''",
              backgroundColor:
                theme.colorScheme == "dark"
                  ? "rgb(88, 166, 255)"
                  : "rgb(9, 105, 218)",
              borderRadius: "6px",
              position: "absolute",
              top: "calc(50% - 12px)",
              left: "-8px",
              width: "4px",
            },
            fontWeight: 600,
            backgroundColor:
              theme.colorScheme == "dark"
                ? "rgba(177, 186, 196, 0.08)!important"
                : "rgba(208, 215, 222, 0.24)!important",
            color: theme.colorScheme == "light" && "rgb(36, 41, 47)",
          },
          ":hover": {
            backgroundColor: "rgba(177, 186, 196, 0.08)",
          },
        },
        tabsList: {
          gap: 6,
        },
      }}
    >
      {props.children}
    </Tabs>
  );
};

TabNav.List = Tabs.List;
TabNav.Tab = (
  props: Omit<React.ComponentProps<typeof Tabs.Tab>, "icon"> & TabNavTabProps
) => (
  <Tabs.Tab {...props} icon={undefined}>
    <Group>
      {props.icon && props.icon}
      <Text>{props.children}</Text>
    </Group>
  </Tabs.Tab>
);

export default TabNav;
