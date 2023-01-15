import {
  Avatar,
  Group,
  Menu,
  Text,
  UnstyledButton,
  useMantineColorScheme
} from "@mantine/core";
import { useRouter } from "next/router";
import {
  HiAdjustments,
  HiChevronDown,
  HiChevronRight,
  HiCog,
  HiInformationCircle,
  HiLibrary,
  HiLogout,
  HiMoon,
  HiSun,
  HiUser
} from "react-icons/hi";
import { useFrameworkUser } from "../../contexts/FrameworkUser";
import useSidebar from "../../stores/useSidebar";
import useUpdateDrawer from "../../stores/useUpdateDrawer";
import logout from "../../util/api/logout";
import getMediaUrl from "../../util/getMedia";
import { User } from "../../util/prisma-types";
import useMediaQuery from "../../util/useMediaQuery";
import { frameworkStyles } from "../Framework";

const UserMenu = ({
  userMenuOpened,
  right,
}: {
  userMenuOpened: boolean;
  right?: boolean;
}) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { classes, theme, cx } = frameworkStyles();
  const user = useFrameworkUser() as User;
  const router = useRouter();
  const { setOpened: setUpdateDrawerOpened } = useUpdateDrawer();
  const { setOpened: setSidebarOpened } = useSidebar();
  const mobile = useMediaQuery("768");

  return (
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
                  getMediaUrl(user.avatarUri) ||
                  `https://avatars.dicebear.com/api/identicon/${user.id}.png`
                }
                alt={user.username}
                radius="xl"
                size={20}
              />
              <Text weight={600} size="sm" sx={{ lineHeight: 1 }} mr={3}>
                {user.username}
              </Text>
            </div>
            {right ? (
              <HiChevronRight size={12} stroke="1.5" />
            ) : (
              <HiChevronDown size={12} stroke="1.5" />
            )}
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          👻 Framework {process.env.NEXT_PUBLIC_VERSION} - Built by Emil
          {"&"} contributors
        </Menu.Label>
        <Menu.Divider />
        {user.role == "ADMIN" && (
          <>
            <Menu.Item
              icon={<HiLibrary size={18} />}
              onClick={() => router.push("/admin/dashboard")}
            >
              Admin dashboard
            </Menu.Item>
            <Menu.Divider />
          </>
        )}
        <Menu.Item
          icon={<HiUser size={18} />}
          onClick={() => router.push(`/profile/${user.username}`)}
        >
          Profile
        </Menu.Item>
        <Menu.Item
          icon={<HiAdjustments size={18} />}
          onClick={() => router.push("/avatar")}
        >
          Avatar
        </Menu.Item>
        <Menu.Item
          icon={
            colorScheme === "dark" ? <HiMoon size={18} /> : <HiSun size={18} />
          }
          color={colorScheme === "dark" ? "yellow" : "blue"}
          onClick={() => toggleColorScheme()}
        >
          Change theme
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          icon={<HiCog size={18} />}
          onClick={() => router.push("/settings")}
        >
          Settings
        </Menu.Item>
        <Menu.Item
          icon={<HiInformationCircle size={18} />}
          onClick={() => {
            setUpdateDrawerOpened(true);
            if (mobile) setSidebarOpened(false);
          }}
        >
          What&apos;s new?
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          sx={{ fontWeight: 500 }}
          color="red"
          icon={<HiLogout />}
          onClick={async () => await logout().then(() => router.push("/login"))}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default UserMenu;
