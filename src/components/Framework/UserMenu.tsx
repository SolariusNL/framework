import {
  Avatar,
  Badge,
  Group,
  HoverCard,
  Menu,
  Modal,
  Text,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
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
  HiGlobe,
  HiInformationCircle,
  HiLibrary,
  HiLogout,
  HiMoon,
  HiQrcode,
  HiSun,
  HiUser,
  HiUsers,
} from "react-icons/hi";
import useAuthorizedUserStore from "../../stores/useAuthorizedUser";
import useFeedback from "../../stores/useFeedback";
import useSidebar from "../../stores/useSidebar";
import useUpdateDrawer from "../../stores/useUpdateDrawer";
import logout from "../../util/api/logout";
import getMediaUrl from "../../util/get-media";
import useMediaQuery from "../../util/media-query";
import ClickToReveal from "../ClickToReveal";
import { frameworkStyles } from "../Framework";

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
  const { setOpened: setFeedbackOpened } = useFeedback();
  const mobile = useMediaQuery("768");
  const [quickLoginOpened, setQuickLoginOpened] = React.useState(false);
  const [qrDataUrl, setQrDataUrl] = React.useState("");

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

  const headers = {
    "Content-Type": "application/json",
    Authorization: String(getCookie(".frameworksession")),
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
          <Menu.Item
            icon={<HiGlobe />}
            onClick={() => {
              setFeedbackOpened(true);
              if (mobile) setSidebarOpened(false);
            }}
          >
            Feedback
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
      <Dropdown />
    </>
  );
};

export default UserMenu;
