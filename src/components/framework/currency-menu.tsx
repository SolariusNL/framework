import Bit from "@/icons/Bit";
import Exchange from "@/icons/Exchange";
import Rocket from "@/icons/Rocket";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import IResponseBase from "@/types/api/IResponseBase";
import abbreviateNumber from "@/util/abbreviate";
import fetchJson from "@/util/fetch";
import { Fw } from "@/util/fw";
import {
  Badge,
  Button,
  CloseButton,
  Group,
  Menu,
  Modal,
  Popover,
  Text,
  Tooltip,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import {
  HiArrowRight,
  HiOutlineGift,
  HiOutlineShoppingBag,
  HiOutlineSparkles,
  HiOutlineTicket,
  HiOutlineViewList,
  HiTicket,
} from "react-icons/hi";
import { useFrameworkComponentStyles } from "../framework.styles";

const CurrencyMenu = ({
  currencyMenuOpened,
  minimal,
  bits,
}: {
  currencyMenuOpened: boolean;
  minimal?: boolean;
  bits?: boolean;
}) => {
  const router = useRouter();
  const { classes, theme, cx } = useFrameworkComponentStyles();
  const { user, setProperty } = useAuthorizedUserStore();
  const [prizeReminder, setPrizeReminder] = useLocalStorage({
    key: "@fw/daily-prize-reminder",
    defaultValue: false,
  });
  const [menuOpened, setMenuOpened] = React.useState(false);
  const [modalOpened, setModalOpened] = React.useState(false);
  const [celebration, setCelebration] = React.useState(false);

  const Target = (
    <UnstyledButton
      className={cx(classes.currency, {
        [classes.currencyActive]: currencyMenuOpened,
      })}
      onClick={() => {
        if (!bits) setMenuOpened(!menuOpened);
      }}
    >
      <Group spacing={6}>
        {bits ? (
          <Bit color={theme.colors.violet[3]} />
        ) : (
          <HiTicket color={theme.colors.green[3]} />
        )}
        {!minimal && (
          <Text
            color={bits ? theme.colors.violet[4] : theme.colors.green[4]}
            weight={600}
            size="sm"
            sx={{ lineHeight: 1 }}
          >
            {abbreviateNumber(bits ? user?.bits! : user?.tickets!)}
          </Text>
        )}
      </Group>
    </UnstyledButton>
  );
  const Dropdown = (
    <>
      <Menu.Label>
        You have{" "}
        {Math.round(user?.tickets!)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
        tickets
      </Menu.Label>

      <Menu.Item
        icon={<HiOutlineTicket />}
        onClick={() => router.push("/tickets")}
      >
        Your Tickets
      </Menu.Item>
      <Menu.Item
        icon={<HiOutlineViewList />}
        onClick={() => router.push("/tickets/transactions")}
      >
        Transaction history
      </Menu.Item>
      <Menu.Divider />
      <Menu.Label>Store</Menu.Label>
      <Menu.Item
        icon={<HiOutlineShoppingBag />}
        onClick={() => router.push("/tickets/buy")}
      >
        Purchase Tickets
      </Menu.Item>
      <Menu.Item icon={<HiOutlineShoppingBag />}>Purchase Studio</Menu.Item>
      {!user?.premium && (
        <>
          <Menu.Divider />
          <Menu.Item icon={<Rocket />} onClick={() => router.push("/premium")}>
            Get premium
          </Menu.Item>
        </>
      )}
      <Menu.Divider />
      <Menu.Item
        icon={<HiOutlineGift />}
        onClick={() => router.push("/prizes")}
      >
        Daily prizes
      </Menu.Item>
      <Menu.Item
        icon={<HiOutlineSparkles />}
        onClick={() => router.push("/redeem")}
      >
        Redeem code
      </Menu.Item>
    </>
  );

  return (
    <>
      <Modal
        title="Bits"
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        className={useMantineColorScheme().colorScheme}
      >
        <div className="flex justify-center text-center flex-col items-center">
          <Group spacing={6}>
            <Bit color={theme.colors.violet[3]} className="w-6 h-6" />
            <Text
              color={theme.colors.violet[4]}
              weight={600}
              size="lg"
              sx={{ lineHeight: 1 }}
            >
              {Fw.Nums.beautify(user?.bits! || 0)}
            </Text>
          </Group>
          <Exchange
            className="text-dimmed my-4 w-10 h-10"
            style={{
              transform: "rotate(90deg)",
            }}
          />
          <Group spacing={6}>
            <HiOutlineTicket
              color={theme.colors.green[3]}
              className="w-6 h-6"
            />
            <Text
              color={theme.colors.green[4]}
              weight={600}
              size="lg"
              sx={{ lineHeight: 1 }}
            >
              {Fw.Nums.beautify(
                Math.floor(user?.bits! / 100) * 10 +
                  Math.round((user?.bits! % 100) / 10) || 0
              )}
            </Text>
          </Group>
        </div>
        <Text align="center" color="dimmed" size="sm" mt="lg" mb="xl">
          Bits are earned by participating in the community, and by logging in
          daily.
        </Text>
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <Badge color="violet" radius="sm" className="px-2 w-fit" size="xl">
              <div className="flex items-center gap-2">
                <Bit />
                <span>10</span>
              </div>
            </Badge>
            <HiArrowRight className="text-dimmed w-6 h-6 stroke-1" />
            <Badge color="teal" radius="sm" className="px-2 w-fit" size="xl">
              <div className="flex items-center gap-2">
                <HiOutlineTicket />
                <span>1</span>
              </div>
            </Badge>
          </div>
        </div>
        <div className="flex md:flex-row flex-col justify-center gap-2">
          <Button
            variant="light"
            radius="xl"
            leftIcon={<HiOutlineGift />}
            onClick={() => {
              router.push("/prizes");
              setModalOpened(false);
            }}
            color="violet"
          >
            Redeem daily prize
          </Button>
          <Button
            variant="light"
            radius="xl"
            leftIcon={<Exchange />}
            onClick={async () => {
              setProperty(
                "tickets",
                user?.tickets! +
                  Math.floor(user?.bits! / 100) * 10 +
                  Math.round((user?.bits! % 100) / 10)
              );
              setProperty("bits", 0);
              await fetchJson<IResponseBase>("/api/users/bits", {
                auth: true,
              });
              setCelebration(true);
              setTimeout(() => setCelebration(false), 5000);
            }}
            disabled={user?.bits! < 100}
            color="violet"
          >
            Convert Bits to T$
          </Button>
        </div>
      </Modal>
      <Menu
        transition="pop-top-right"
        onChange={() => {
          if (bits) {
            setModalOpened(true);
          }
        }}
        opened={menuOpened}
        closeOnClickOutside
        onClose={() => setMenuOpened(false)}
      >
        <Menu.Target>
          {bits ? (
            <Popover
              opened={
                bits &&
                router.pathname !== "/prizes" &&
                !prizeReminder &&
                user?.emailVerified &&
                new Date().getTime() -
                  new Date(user?.lastRandomPrize!).getTime() >
                  1000 * 60 * 60 * 24
              }
              shadow="md"
              classNames={{ dropdown: "md:w-[280px] w-[250px]" }}
              withArrow
              position="bottom"
            >
              <Popover.Target>{Target}</Popover.Target>
              <Popover.Dropdown>
                <div className="w-full flex items-center justify-between">
                  <Text>Daily prize available</Text>
                  <Tooltip label="Don't show this again">
                    <CloseButton onClick={() => setPrizeReminder(true)} />
                  </Tooltip>
                </div>
                <Text size="sm" color="dimmed" mt="xs">
                  You can get a daily prize once every 24 hours, and yours is
                  now ready to be claimed!
                </Text>
                <Link href="/prizes" passHref>
                  <Button
                    mt="sm"
                    fullWidth
                    variant="gradient"
                    className="transition-all"
                    gradient={{
                      from: "violet",
                      to: "grape",
                    }}
                  >
                    Claim prize
                  </Button>
                </Link>
              </Popover.Dropdown>
            </Popover>
          ) : (
            Target
          )}
        </Menu.Target>

        <Menu.Dropdown>{Dropdown}</Menu.Dropdown>
      </Menu>
    </>
  );
};

export default CurrencyMenu;
