import { Group, Menu, Text, UnstyledButton } from "@mantine/core";
import { useRouter } from "next/router";
import {
  HiCurrencyDollar,
  HiShoppingBag,
  HiStar,
  HiViewList,
} from "react-icons/hi";
import { useFrameworkUser } from "../../contexts/FrameworkUser";
import abbreviateNumber from "../../util/abbreviate";
import { User } from "../../util/prisma-types";
import { frameworkStyles } from "../Framework";

const CurrencyMenu = ({
  currencyMenuOpened,
}: {
  currencyMenuOpened: boolean;
}) => {
  const router = useRouter();
  const { classes, theme, cx } = frameworkStyles();
  const user = useFrameworkUser() as User;

  return (
    <Menu transition="pop-top-right">
      <Menu.Target>
        <UnstyledButton
          className={cx(classes.currency, {
            [classes.currencyActive]: currencyMenuOpened,
          })}
        >
          <Group spacing={6}>
            <HiCurrencyDollar color={theme.colors.green[3]} />
            <Text
              color={theme.colors.green[4]}
              weight={500}
              size="sm"
              sx={{ lineHeight: 1 }}
            >
              {abbreviateNumber(user.tickets)}
            </Text>
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          You have{" "}
          {Math.round(user.tickets)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
          tickets
        </Menu.Label>

        <Menu.Item
          icon={<HiCurrencyDollar />}
          onClick={() => router.push("/tickets")}
        >
          Your Tickets
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          icon={<HiShoppingBag />}
          onClick={() => router.push("/tickets/buy")}
        >
          Purchase tickets
        </Menu.Item>
        <Menu.Item
          icon={<HiViewList />}
          onClick={() => router.push("/tickets/transactions")}
        >
          Transaction history
        </Menu.Item>

        {!user.premium && (
          <>
            <Menu.Divider />
            <Menu.Item
              icon={<HiStar />}
              onClick={() => router.push("/premium")}
            >
              Get premium
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};

export default CurrencyMenu;
