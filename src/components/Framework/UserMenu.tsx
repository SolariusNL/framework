import {
  Avatar,
  Badge,
  Button,
  Group,
  HoverCard,
  Menu,
  Modal,
  Text,
  Textarea,
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
  HiArrowRight,
  HiCheckCircle,
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
import useSidebar from "../../stores/useSidebar";
import useUpdateDrawer from "../../stores/useUpdateDrawer";
import logout from "../../util/api/logout";
import getMediaUrl from "../../util/get-media";
import useMediaQuery from "../../util/media-query";
import ClickToReveal from "../ClickToReveal";
import Descriptive from "../Descriptive";
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
  const [ratingModal, setRatingModal] = React.useState(false);
  const [feedback, setFeedback] = React.useState("");
  const [rating, setRating] = React.useState(0);
  const feedbackRef = React.useRef<HTMLTextAreaElement>(null);

  const submitRating = async (stars: number, feedback: string = "") => {
    setLoading(true);
    await fetch("/api/users/@me/survey/" + stars, {
      method: "POST",
      headers,
      body: JSON.stringify({ feedback }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          if (stars !== 0) {
            showNotification({
              title: "Thank you",
              message:
                "Thank you for your feedback, we sincerely value your opinion and will use it to improve our platform.",
              icon: <HiCheckCircle />,
            });
          }
          setProperty("lastSurvey", new Date());
        } else {
          setProperty("lastSurvey", new Date());
          setLoading(false);
        }
      });
  };

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

  const FeedbackBody = ({
    value,
    onChange,
    ref,
  }: {
    value: string;
    onChange: (value: string) => void;
    ref: any;
  }) => {
    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
      },
      [onChange]
    );

    return (
      <Textarea
        label="Feedback"
        placeholder="What do you like about Framework? What could we improve?"
        onChange={(e) => handleChange(e)}
        defaultValue={value}
        description="Your feedback is completely anonymous and will help us improve Framework."
        mt="md"
        autoFocus
        key="feedback"
        minRows={4}
      />
    );
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
              setRatingModal(true);
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
      <Modal
        title="Experience survey"
        opened={ratingModal}
        onClose={() => setRatingModal(false)}
      >
        <Text size="sm" color="dimmed" mb="md">
          We only ask for this once every 3 months. We promise it won&apos;t
          take long, and your feedback will help us improve Framework. Thanks!
        </Text>
        <Descriptive
          required
          title="Star rating"
          description="How would you rate your experience with Framework?"
        >
          <Rating value={rating} setValue={setRating} />
        </Descriptive>
        <FeedbackBody
          value={feedback}
          onChange={setFeedback}
          ref={feedbackRef}
        />
        <div className="flex justify-end mt-6">
          <Button
            leftIcon={<HiArrowRight />}
            onClick={() => {
              setRatingModal(false);
              submitRating(rating, feedback);
            }}
          >
            Submit
          </Button>
        </div>
      </Modal>
      <Dropdown />
    </>
  );
};

export default UserMenu;
