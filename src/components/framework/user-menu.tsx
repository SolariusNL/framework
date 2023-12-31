import ClickToReveal from "@/components/click-to-reveal";
import ThemeSwitch from "@/icons/ThemeSwitch";
import useAmoled from "@/stores/useAmoled";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import useFeedback from "@/stores/useFeedback";
import useSidebar from "@/stores/useSidebar";
import useUpdateDrawer from "@/stores/useUpdateDrawer";
import logout from "@/util/api/logout";
import getMediaUrl from "@/util/get-media";
import useMediaQuery from "@/util/media-query";
import {
  Avatar,
  Badge,
  Group,
  HoverCard,
  Menu,
  Modal,
  Text,
  Tooltip,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { getCookie } from "cookies-next";
import Image from "next/image";
import { useRouter } from "next/router";
import { toDataURL } from "qrcode";
import React, { forwardRef, useEffect } from "react";
import {
  HiChevronDown,
  HiChevronRight,
  HiOutlineCloud,
  HiOutlineCog,
  HiOutlineGlobe,
  HiOutlineInformationCircle,
  HiOutlineLibrary,
  HiOutlineLogout,
  HiOutlineQrcode,
  HiOutlineUserCircle,
  HiOutlineUserGroup,
  HiOutlineViewBoards,
} from "react-icons/hi";
import { useFrameworkComponentStyles } from "../framework.styles";

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
  const { classes, theme, cx } = useFrameworkComponentStyles();
  const { user, setProperty } = useAuthorizedUserStore();
  const router = useRouter();
  const { setOpened: setUpdateDrawerOpened } = useUpdateDrawer();
  const { setOpened: setSidebarOpened } = useSidebar();
  const { setOpened: setFeedbackOpened } = useFeedback();
  const mobile = useMediaQuery("768");
  const [quickLoginOpened, setQuickLoginOpened] = React.useState(false);
  const [qrDataUrl, setQrDataUrl] = React.useState("");
  const { enabled: amoled } = useAmoled();

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
            : "https://framework.solarius.me";
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
                    `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.id}`
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
            👻 Framework - Built by Solarius and contributors
          </Menu.Label>
          <Menu.Divider />
          {user?.role == "ADMIN" && (
            <>
              <Menu.Item
                icon={<HiOutlineLibrary />}
                onClick={() => router.push("/admin/dashboard")}
              >
                Admin dashboard
              </Menu.Item>
              <Menu.Divider />
            </>
          )}
          <Menu.Item
            icon={<HiOutlineUserCircle />}
            onClick={() => router.push(`/profile/${user?.username}`)}
          >
            Profile
          </Menu.Item>
          <Menu.Item
            icon={<HiOutlineCloud />}
            onClick={() => router.push("/developer/servers")}
          >
            Developers
          </Menu.Item>
          <Menu.Item
            icon={<HiOutlineViewBoards />}
            onClick={() => router.push("/inventory/" + user?.username)}
          >
            Inventory
          </Menu.Item>
          <Menu.Item
            icon={<HiOutlineUserGroup />}
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
          <Tooltip
            label="Cannot switch themes while AMOLED mode is enabled"
            hidden={!amoled}
          >
            <div>
              <Menu.Item
                icon={<ThemeSwitch />}
                color={colorScheme === "dark" ? "yellow" : "blue"}
                onClick={() => toggleColorScheme()}
                disabled={amoled}
              >
                Change theme
              </Menu.Item>
            </div>
          </Tooltip>
          <Menu.Divider />
          <Menu.Item
            icon={<HiOutlineCog />}
            onClick={() => router.push("/settings/account")}
          >
            Settings
          </Menu.Item>
          <Menu.Item
            icon={<HiOutlineInformationCircle />}
            onClick={() => {
              setUpdateDrawerOpened(true);
              if (mobile) setSidebarOpened(false);
            }}
          >
            What&apos;s new?
          </Menu.Item>
          <Menu.Item
            icon={<HiOutlineGlobe />}
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
              icon={<HiOutlineQrcode />}
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
            icon={<HiOutlineLogout />}
            onClick={async () =>
              openConfirmModal({
                title: "Confirmation",
                children: (
                  <Text size="sm" color="dimmed">
                    Are you sure you want to logout of your account?
                  </Text>
                ),
                labels: {
                  confirm: "Logout",
                  cancel: "Nevermind",
                },
                confirmProps: {
                  variant: "light",
                  color: "red",
                  radius: "xl",
                },
                cancelProps: {
                  variant: "light",
                  radius: "xl",
                  color: "gray",
                },
                async onConfirm() {
                  await logout().then(() => router.push("/login"));
                },
              })
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
