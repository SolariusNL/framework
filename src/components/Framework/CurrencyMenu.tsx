import { Group, Menu, Text, UnstyledButton } from "@mantine/core";
import { useRouter } from "next/router";
import {
  HiCurrencyDollar,
  HiGift,
  HiShoppingBag,
  HiStar,
  HiTicket,
  HiViewList
} from "react-icons/hi";
import useAuthorizedUserStore from "../../stores/useAuthorizedUser";
import abbreviateNumber from "../../util/abbreviate";
import { frameworkStyles } from "../Framework";

const CurrencyMenu = ({
  currencyMenuOpened,
  minimal,
}: {
  currencyMenuOpened: boolean;
  minimal?: boolean;
}) => {
  const router = useRouter();
  const { classes, theme, cx } = frameworkStyles();
  const { user } = useAuthorizedUserStore();

  return (
    <Menu transition="pop-top-right">
      <Menu.Target>
        <UnstyledButton
          className={cx(classes.currency, {
            [classes.currencyActive]: currencyMenuOpened,
          })}
        >
          <Group spacing={6}>
            <HiTicket color={theme.colors.green[3]} />
            {!minimal && (
              <Text
                color={theme.colors.green[4]}
                weight={600}
                size="sm"
                sx={{ lineHeight: 1 }}
              >
                {abbreviateNumber(user?.tickets!)}
              </Text>
            )}
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          You have{" "}
          {Math.round(user?.tickets!)
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
        <Menu.Item
          icon={<HiViewList />}
          onClick={() => router.push("/tickets/transactions")}
        >
          Transaction history
        </Menu.Item>
        <Menu.Divider />
        <Menu.Label>Store</Menu.Label>
        <Menu.Item
          icon={<HiShoppingBag />}
          onClick={() => router.push("/tickets/buy")}
        >
          Purchase Tickets
        </Menu.Item>
        <Menu.Item icon={<HiShoppingBag />}>Purchase Studio</Menu.Item>
        {!user?.premium && (
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
        <Menu.Divider />
        <Menu.Item icon={<HiGift />} onClick={() => router.push("/prizes")}>
          Daily prizes
        </Menu.Item>
        <Menu.Item icon={<HiTicket />} onClick={() => router.push("/redeem")}>
          Redeem code
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default CurrencyMenu;
