import {
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
import Celebration from "react-confetti";
import {
  HiCurrencyDollar,
  HiGift,
  HiShoppingBag,
  HiStar,
  HiTicket,
  HiViewList,
} from "react-icons/hi";
import Bit from "../../icons/Bit";
import Exchange from "../../icons/Exchange";
import useAuthorizedUserStore from "../../stores/useAuthorizedUser";
import IResponseBase from "../../types/api/IResponseBase";
import abbreviateNumber from "../../util/abbreviate";
import clsx from "../../util/clsx";
import fetchJson from "../../util/fetch";
import { frameworkStyles } from "../Framework";

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
  const { classes, theme, cx } = frameworkStyles();
  const { user, setProperty } = useAuthorizedUserStore();
  const [prizeReminder, setPrizeReminder] = useLocalStorage({
    key: "@fw/daily-prize-reminder",
    defaultValue: false,
  });
  const [prizeReminderActivated, setPrizeReminderActivated] = useLocalStorage({
    key: "@fw/daily-prize-reminder-activated",
    defaultValue: 0,
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
          <Menu.Item icon={<HiStar />} onClick={() => router.push("/premium")}>
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
              {user?.bits!}
            </Text>
          </Group>
          <Exchange
            className="text-dimmed my-4 w-10 h-10"
            style={{
              transform: "rotate(90deg)",
            }}
          />
          <Group spacing={6}>
            <HiTicket color={theme.colors.green[3]} className="w-6 h-6" />
            <Text
              color={theme.colors.green[4]}
              weight={600}
              size="lg"
              sx={{ lineHeight: 1 }}
            >
              {Math.floor(user?.bits! / 100) * 10 +
                Math.round((user?.bits! % 100) / 10)}
            </Text>
          </Group>
        </div>
        <Text align="center" color="dimmed" size="sm" mt="lg" mb="xl">
          Bits are a new currency earned by participating in the community and
          by logging in daily. You can convert your bits to tickets at a rate of
          100 bits = 10 tickets.
        </Text>
        <div className="flex flex-col">
          {[
            {
              label: "Convert my Bits to Tickets",
              icon: <Exchange className="text-dimmed" />,
              onClick: async () => {
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
              },
              celebration: true,
              disabled: user?.bits! < 100,
            },
            {
              label: "Redeem daily prize",
              icon: <HiGift className="text-dimmed" />,
              onClick: () => {
                setPrizeReminderActivated(Date.now());
                router.push("/prizes");
                setModalOpened(false);
              },
              celebration: false,
            },
          ]
            .filter((item) => item)
            .map((item, i) => (
              <React.Fragment key={item.label}>
                <div
                  key={item.label}
                  className={clsx(
                    "p-4 dark:bg-mantine-paper-dark bg-gray-100 hover:bg-gray-200 dark:hover:bg-mantine-paper-dark/50 cursor-pointer",
                    "transition-all flex items-center justify-center text-center",
                    i === 0 ? "rounded-t-md" : "rounded-b-md",
                    item.disabled && "opacity-50 pointer-events-none"
                  )}
                  onClick={() => {
                    item.onClick();
                    setMenuOpened(false);
                  }}
                >
                  {item.celebration && celebration && (
                    <div
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      className="absolute pointer-events-none top-0 left-0 right-0 bottom-0 flex items-center justify-center"
                    >
                      <Celebration
                        style={{
                          width: "100%",
                          height: "100%",
                        }}
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <Text size="sm" weight={500} color="dimmed">
                      {item.label}
                    </Text>
                  </div>
                </div>
              </React.Fragment>
            ))}
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
                !prizeReminder &&
                new Date().getTime() -
                  new Date(user?.lastRandomPrize!).getTime() >
                  1000 * 60 * 60 * 24 &&
                new Date().getTime() - prizeReminderActivated >
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
                      from: "grape",
                      to: "violet",
                    }}
                    onClick={() => {
                      setPrizeReminderActivated(new Date().getTime());
                      setPrizeReminder(true);
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
