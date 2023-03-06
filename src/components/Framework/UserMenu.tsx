import {
  Avatar,
  Badge,
  CloseButton,
  Group,
  HoverCard,
  Menu,
  Modal,
  Popover,
  Skeleton,
  Text,
  Tooltip,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import Image from "next/image";
import { useRouter } from "next/router";
import { toDataURL } from "qrcode";
import React, { forwardRef, useEffect } from "react";
import {
  HiChevronDown,
  HiChevronRight,
  HiCloud,
  HiCog,
  HiGift,
  HiInformationCircle,
  HiLibrary,
  HiLogout,
  HiMoon,
  HiQrcode,
  HiSun,
  HiUser,
  HiUsers,
  HiXCircle,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import useAuthorizedUserStore from "../../stores/useAuthorizedUser";
import useSidebar from "../../stores/useSidebar";
import useUpdateDrawer from "../../stores/useUpdateDrawer";
import logout from "../../util/api/logout";
import getMediaUrl from "../../util/get-media";
import useMediaQuery from "../../util/media-query";
import ClickToReveal from "../ClickToReveal";
import { frameworkStyles } from "../Framework";
import Rating from "../Rating";

const headers = {
  "Content-Type": "application/json",
  Authorization: String(getCookie(".frameworksession")),
};

const UserMenu = ({
  userMenuOpened,
  right,
  minimal,
}: {
  userMenuOpened: boolean;
  right?: boolean;
  minimal?: boolean;
}) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { classes, theme, cx } = frameworkStyles();
  const { user, setProperty } = useAuthorizedUserStore();
  const router = useRouter();
  const { setOpened: setUpdateDrawerOpened } = useUpdateDrawer();
  const { setOpened: setSidebarOpened } = useSidebar();
  const mobile = useMediaQuery("768");
  const [quickLoginOpened, setQuickLoginOpened] = React.useState(false);
  const [qrDataUrl, setQrDataUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const refetch = async () => {
    await fetch("/api/auth/loginqr/generate", {
      method: "POST",
      headers,
    })
      .then((res) => res.json())
      .then((data) => {
        setProperty("loginQR", data.code);
        const apiUrl =
          process.env.NODE_ENV === "development"
            ? "http://10.1.1.5:3000"
            : "https://framework.soodam.rocks";
        toDataURL(
          `${apiUrl}/api/auth/loginqr/verify/${data.code}`,
          {
            width: 256,
          },
          (err, url) => {
            if (err) throw err;
            setQrDataUrl(url);
          }
        );
      });
  };

  const submitRating = async (stars: number) => {
    setLoading(true);
    await fetch("/api/users/@me/survey/" + stars, {
      method: "POST",
      headers,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          if (stars !== 0) {
            showNotification({
              title: "Thank you",
              message:
                "Thank you for your feedback, it helps us make the platform great! You've been awarded 250T$ for your participation",
              icon: <HiGift />,
            });
          }
          setProperty("lastSurvey", new Date());
          setProperty("tickets", user?.tickets! + 250);
        } else {
          setProperty("lastSurvey", new Date());
          setLoading(false);
        }
      });
  };

  const Dropdown = forwardRef<HTMLDivElement>((props, ref) => (
    <div ref={ref!} {...props}>
      <Menu
        transition={right ? "pop" : "pop-top-right"}
        width={240}
        position={right ? "right" : undefined}
      >
        <Menu.Target>
          <UnstyledButton
            className={cx(classes.user, {
              [classes.userActive]: userMenuOpened,
            })}
            {...(right && {
              sx: {
                width: "100%",
              },
            })}
          >
            <Group
              spacing={12}
              {...(right && {
                position: "apart",
              })}
            >
              <div className="flex items-center gap-4">
                <Avatar
                  src={
                    getMediaUrl(user?.avatarUri!) ||
                    `https://avatars.dicebear.com/api/identicon/${user?.id}.png`
                  }
                  alt={user?.username}
                  radius="xl"
                  size={20}
                />
                {!minimal && (
                  <>
                    <Text weight={600} size="sm" sx={{ lineHeight: 1 }} mr={3}>
                      {user?.username}
                    </Text>
                    {right ? (
                      <HiChevronRight size={12} stroke="1.5" />
                    ) : (
                      <HiChevronDown size={12} stroke="1.5" />
                    )}
                  </>
                )}
              </div>
            </Group>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>
            👻 Framework - Built by Soodam.re and contributors
          </Menu.Label>
          <Menu.Divider />
          {user?.role == "ADMIN" && (
            <>
              <Menu.Item
                icon={<HiLibrary />}
                onClick={() => router.push("/admin/dashboard")}
              >
                Admin dashboard
              </Menu.Item>
              <Menu.Divider />
            </>
          )}
          <Menu.Item
            icon={<HiUser />}
            onClick={() => router.push(`/profile/${user?.username}`)}
          >
            Profile
          </Menu.Item>
          <Menu.Item
            icon={<HiCloud />}
            onClick={() => router.push("/developer")}
          >
            Developers
          </Menu.Item>
          <Menu.Item
            icon={<HiUsers />}
            onClick={() => router.push("/teams")}
            rightSection={
              <HoverCard width={300} shadow="lg">
                <HoverCard.Target>
                  <Badge>Beta</Badge>
                </HoverCard.Target>
                <HoverCard.Dropdown>
                  <Text size="lg">Teams</Text>
                  <Text size="sm" color="dimmed">
                    Teams are a new way to collaborate, organize, and manage
                    your games and teammates. Teams are currently in beta, and
                    major changes are expected.
                  </Text>
                </HoverCard.Dropdown>
              </HoverCard>
            }
          >
            Teams
          </Menu.Item>
          <Menu.Item
            icon={colorScheme === "dark" ? <HiMoon /> : <HiSun />}
            color={colorScheme === "dark" ? "yellow" : "blue"}
            onClick={() => toggleColorScheme()}
          >
            Change theme
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            icon={<HiCog />}
            onClick={() => router.push("/settings/account")}
          >
            Settings
          </Menu.Item>
          <Menu.Item
            icon={<HiInformationCircle />}
            onClick={() => {
              setUpdateDrawerOpened(true);
              if (mobile) setSidebarOpened(false);
            }}
          >
            What&apos;s new?
          </Menu.Item>
          <Menu.Divider />
          {user?.quickLoginEnabled && (
            <Menu.Item
              icon={<HiQrcode />}
              onClick={() => {
                setQuickLoginOpened(true);
                setSidebarOpened(false);
                setUpdateDrawerOpened(false);
              }}
            >
              Quick login
            </Menu.Item>
          )}
          <Menu.Item
            sx={{ fontWeight: 500 }}
            color="red"
            icon={<HiLogout />}
            onClick={async () =>
              await logout().then(() => router.push("/login"))
            }
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  ));

  useEffect(() => {
    if (quickLoginOpened) {
      refetch();
      const interval = setInterval(() => {
        refetch();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [quickLoginOpened]);

  return (
    <>
      <Modal
        title="Quick login"
        opened={quickLoginOpened}
        onClose={() => setQuickLoginOpened(false)}
      >
        <Text size="sm" color="dimmed" mb="lg">
          Scan this QR code with your camera to log in to Framework on another
          device. Do not share this code with anyone. It allows anyone with this
          code to log in to your account.
        </Text>

        <div className="flex justify-center p-4 flex-col items-center">
          <ClickToReveal
            hiddenType="blur"
            blurStrength={8}
            className="rounded-md mb-8 w-fit"
          >
            <Image
              src={qrDataUrl}
              width={256}
              height={256}
              className="rounded-md w-fit"
            />
          </ClickToReveal>
          <Text size="sm" color="dimmed" align="center">
            Click to reveal QR code
          </Text>
        </div>
      </Modal>
      <ReactNoSSR onSSR={<Skeleton width={240} height={"100%"} />}>
        <Popover
          shadow="md"
          opened={
            (typeof window !== "undefined" &&
              new Date(user?.lastSurvey as Date).getTime() <
                Date.now() - 3 * 30 * 24 * 60 * 60 * 1000) ||
            !user?.lastSurvey
          }
          closeOnClickOutside
          onClose={() => submitRating(0)}
        >
          <Popover.Target>
            <Dropdown />
          </Popover.Target>
          <Popover.Dropdown className="items-center justify-center flex flex-col">
            <>
              <div className="flex items-center gap-2 mb-2">
                <Text size="sm">How are we doing?</Text>
                <Tooltip label="Not now">
                  <CloseButton
                    size="sm"
                    onClick={() => {
                      setProperty("lastSurvey", new Date());
                      submitRating(0);
                    }}
                  />
                </Tooltip>
              </div>
              <Rating onRatingConfirmation={submitRating} loading={loading} />
            </>
          </Popover.Dropdown>
        </Popover>
      </ReactNoSSR>
    </>
  );
};

export default UserMenu;
