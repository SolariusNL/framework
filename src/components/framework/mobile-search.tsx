import { Group, Menu, UnstyledButton } from "@mantine/core";
import { HiSearch } from "react-icons/hi";
import { useFrameworkComponentStyles } from "../framework.styles";
import Search from "./search";

const MobileSearchMenu = ({
  opened,
  minimal,
}: {
  opened: boolean;
  minimal?: boolean;
}) => {
  const { classes, cx } = useFrameworkComponentStyles();

  return (
    <Menu transition="pop-top-right">
      <Menu.Target>
        <UnstyledButton
          className={cx(classes.currency, {
            [classes.currencyActive]: opened,
          })}
        >
          <Group spacing={6}>
            <HiSearch />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Search mobile />
      </Menu.Dropdown>
    </Menu>
  );
};

export default MobileSearchMenu;
