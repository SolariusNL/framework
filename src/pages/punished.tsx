import Framework from "@/components/framework";
import logout from "@/util/api/logout";
import authorizedRoute from "@/util/auth";
import { User } from "@/util/prisma-types";
import {
  Anchor,
  Badge,
  Button,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { HiLockOpen, HiLogout } from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";

const PRIMARY_COL_HEIGHT = 300;

const Punished: React.FC<{
  user: User;
}> = ({ user }) => {
  const router = useRouter();
  const theme = useMantineTheme();
  const calculateRemainingTime = () => {
    const timeDifference =
      new Date(user.banExpires as Date).getTime() - new Date().getTime();
    const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.ceil(timeDifference / (1000 * 60 * 60));
    const minutesRemaining = Math.ceil(timeDifference / (1000 * 60));

    if (daysRemaining >= 1) {
      return `${daysRemaining} day${daysRemaining > 1 ? "s" : ""} from now`;
    } else if (hoursRemaining >= 1) {
      return `${hoursRemaining} hour${hoursRemaining > 1 ? "s" : ""} from now`;
    } else if (minutesRemaining >= 1) {
      return `${minutesRemaining} minute${
        minutesRemaining > 1 ? "s" : ""
      } from now`;
    } else {
      return "Less than a minute from now";
    }
  };

  useEffect(() => {
    if (!user.banned) {
      router.push("/");
    }
  });

  return (
    <Framework user={user} activeTab="none">
      <ReactNoSSR>
        <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-[37.5rem]">
          <Title order={3} mb="md">
            Account suspended
          </Title>
          <Text color="dimmed" size="sm" mb="xs">
            Your account has been suspended from Framework for violating our{" "}
            <Link href="/terms" passHref>
              <Anchor>Terms of Service</Anchor>
            </Link>{" "}
            and / or the{" "}
            <Link href="/guidelines" passHref>
              <Anchor>Community Guidelines</Anchor>
            </Link>
            .
          </Text>
          <Text color="dimmed" size="sm" mb="lg">
            Please review your ticket below. You may reactivate your account on
            the date posted below, unless you have received a permanent
            suspension.
          </Text>
          <Text color="dimmed" size="sm" weight={700} mb="xs">
            Ban notice
          </Text>
          <Text mb="md">{user.banReason}</Text>
          <Text color="dimmed" size="sm" weight={700} mb="xs">
            Ban expires
          </Text>
          <div className="flex mb-6 items-center gap-3">
            <Tooltip label={new Date(user.banExpires as Date).toUTCString()}>
              <Text className="flex items-center gap-2 w-fit">
                {new Date(user.banExpires as Date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {new Date(user.banExpires as Date).getFullYear() === 9999 && (
                  <Badge radius="md" color="red">
                    Permanent Ban
                  </Badge>
                )}
              </Text>
            </Tooltip>
            <Text size="sm" color="dimmed" weight={500}>
              {user.banExpires && calculateRemainingTime()}
            </Text>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={async () => {
                if (
                  new Date(user.banExpires as Date).getTime() <=
                  new Date().getTime()
                ) {
                  await fetch("/api/users/@me/unlock", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: String(getCookie(".frameworksession")),
                    },
                  }).then(() => router.reload());
                } else {
                  await logout().then(() => router.reload());
                }
              }}
              leftIcon={
                new Date(user.banExpires as Date).getTime() <=
                new Date().getTime() ? (
                  <HiLockOpen />
                ) : (
                  <HiLogout />
                )
              }
            >
              {new Date(user.banExpires as Date).getTime() <=
              new Date().getTime()
                ? "Unlock my account"
                : "Logout of your account"}
            </Button>
          </div>
        </div>
      </ReactNoSSR>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Punished;
